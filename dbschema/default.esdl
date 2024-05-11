module default {
  type User {
    required email: str {
      constraint exclusive;
    };
    required clerkId: str {
      constraint exclusive;
    };
    multi inboxes := (.<user[is Inbox]);

    required property createdAt -> datetime {
        default := std::datetime_current();
        readonly := true;
    };
  }

  type Inbox {
    required email: str {
      constraint exclusive;
    };
    required mailslurpInboxId: str {
      constraint exclusive;
    };
    required user: User;
    icon: str;
    multi domains := (.<inbox[is Domain]);
    
    required property createdAt -> datetime {
        default := std::datetime_current();
        readonly := true;
    };
  }

  type Domain {
    required name: str;
    required single inbox: Inbox {
      on target delete delete source;
    };

    required property createdAt -> datetime {
        default := std::datetime_current();
        readonly := true;
    };
  }

  type ReplyClient {
    required email: str {
      constraint exclusive;
    };
    required externalEmail: str;
    required single userInbox: Inbox;
  }
};