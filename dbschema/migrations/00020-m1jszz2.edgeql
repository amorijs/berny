CREATE MIGRATION m1jszz2g7behtulbn66rchjvhwa5ig3gkghl5ese4ftdw4bggw7vha
    ONTO m1p4w6y3h3aa3enwjnx7pj36dr3jue76tfxfudtu2p2xhjsambwn6q
{
  ALTER TYPE default::ReplyClient {
      CREATE REQUIRED PROPERTY externalEmail: std::str {
          SET REQUIRED USING (<std::str>{});
      };
  };
};
