CREATE MIGRATION m1p4w6y3h3aa3enwjnx7pj36dr3jue76tfxfudtu2p2xhjsambwn6q
    ONTO m1foqxa7ox46oxdjnwi6xq7hvw2f2443qpclysqdksnorepkglo5oa
{
  CREATE TYPE default::ReplyClient {
      CREATE REQUIRED SINGLE LINK inbox: default::Inbox;
      CREATE REQUIRED PROPERTY email: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY userEmail: std::str;
  };
};
