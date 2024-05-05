CREATE MIGRATION m1e4j2sl33jasdk77rpuhif4klfmi65zv7v6d4ew7nwsh3noyy6cyq
    ONTO initial
{
  CREATE TYPE default::Inbox {
      CREATE REQUIRED PROPERTY domains: std::str;
      CREATE REQUIRED PROPERTY email: std::str;
      CREATE PROPERTY icon: std::str;
      CREATE REQUIRED PROPERTY mailslurpInboxId: std::str;
  };
  CREATE TYPE default::User {
      CREATE MULTI LINK inboxes: default::Inbox;
      CREATE REQUIRED PROPERTY clerkId: std::str;
      CREATE REQUIRED PROPERTY email: std::str;
  };
};
