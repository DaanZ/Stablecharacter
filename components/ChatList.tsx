import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";

interface ChatListProps {
  supabase: any;
  userEmail?: string;
  characterGroups: any;
  onChatSelect: (character_id: string | null) => void;
  selectedCharacter: string | null;
  refreshTrigger?: number;
  onChatDelete?: (character_id: string) => void;
  onClose: () => void;
  currentMessages?: any[];
}

export default function ChatList({
  supabase,
  userEmail,
  characterGroups,
  onChatSelect,
  selectedCharacter,
  refreshTrigger = 0,
  onChatDelete,
  onClose,
  currentMessages = [],
}: ChatListProps) {
  const [chats, setChats] = useState<any[]>([]);

  const loadChats = async () => {
    if (!userEmail) {
      if (selectedCharacter && currentMessages.length > 0) {
        setChats([
          {
            id: "current",
            character_id: selectedCharacter,
            messages: currentMessages,
          },
        ]);
      }
      return;
    }

    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("email", userEmail)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setChats(data);
    }
  };

  useEffect(() => {
    loadChats();

    if (userEmail) {
      const channel = supabase
        .channel("chat_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "chats",
            filter: `email=eq.${userEmail}`,
          },
          () => {
            loadChats();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [supabase, userEmail, refreshTrigger, selectedCharacter, currentMessages]);

  const getCharacterInfo = (character_id: string) => {
    for (const group of Object.values(characterGroups)) {
      if (character_id in group.characters) {
        return group.characters[character_id];
      }
    }
    return null;
  };

  const getLastMessage = (messages: any[]) => {
    try {
      if (!Array.isArray(messages) || messages.length === 0) return "";
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || typeof lastMessage.text !== "string") return "";

      const truncated =
        lastMessage.text.length > 35
          ? lastMessage.text.substring(0, 35) + "..."
          : lastMessage.text;
      return truncated;
    } catch (error) {
      console.error("Error in getLastMessage:", error);
      return "";
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const { data: chatToDelete, error: fetchError } = await supabase
        .from("chats")
        .select("*")
        .eq("id", chatId)
        .single();

      if (fetchError) {
        console.error("Error fetching chat to delete:", fetchError);
        return;
      }

      const { error: insertError } = await supabase
        .from("deleted_chats")
        .insert({
          email: chatToDelete.email,
          messages: chatToDelete.messages,
          character_id: chatToDelete.character_id,
          created_at: chatToDelete.created_at,
        });

      if (insertError) {
        console.error("Error moving chat to deleted_chats:", insertError);
        return;
      }

      const { error: deleteError } = await supabase
        .from("chats")
        .delete()
        .eq("id", chatId);

      if (!deleteError) {
        setChats(chats.filter((chat) => chat.id !== chatId));
        onChatDelete?.(chatToDelete.character_id);
      }
    } catch (error) {
      console.error("Error in delete operation:", error);
    }
  };

  return (
    <div className="w-full sm:w-80 border-r h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold">Your Conversations</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="sm:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => {
          const character = getCharacterInfo(chat.character_id);
          if (!character) return null;

          return (
            <div key={chat.id} className="group relative">
              <Button
                variant="ghost"
                className={`w-full justify-start px-4 py-3 h-auto ${
                  selectedCharacter === chat.character_id ? "bg-muted" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (chat.character_id) {
                    onChatSelect(chat.character_id);
                  }
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={character.avatar}
                      alt={character.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-start overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{character.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {chat.character_id.split("_")[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {character.occupation}
                    </span>
                    <span className="text-sm text-muted-foreground truncate w-full">
                      {getLastMessage(chat.messages)}
                    </span>
                  </div>
                </div>
              </Button>
              {userEmail && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}