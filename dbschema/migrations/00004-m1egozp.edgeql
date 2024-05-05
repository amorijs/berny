CREATE MIGRATION m1egozpvihnsuxhzsxyeh76qzk57xb2cjhfzq2yefeo4t6x6th5a3q
    ONTO m1pgqjb6eeell4zjmcrvef54s2auqaetuqgebrt5drsdoregzyymtq
{
  ALTER TYPE default::Inbox {
      ALTER LINK user {
          SET REQUIRED USING (<default::User>{});
      };
  };
  CREATE TYPE default::InboxReplier {
      CREATE REQUIRED SINGLE LINK inbox: default::Inbox;
      CREATE REQUIRED PROPERTY replyTo: std::str;
  };
};
