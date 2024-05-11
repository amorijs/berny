CREATE MIGRATION m1akt2c734jjbbbclmxsosz3z56grcyobrp7vhnqkjcemddwe5je7a
    ONTO m1jszz2g7behtulbn66rchjvhwa5ig3gkghl5ese4ftdw4bggw7vha
{
  ALTER TYPE default::ReplyClient {
      ALTER LINK inbox {
          RENAME TO userInbox;
      };
  };
  ALTER TYPE default::ReplyClient {
      DROP PROPERTY userEmail;
  };
};
