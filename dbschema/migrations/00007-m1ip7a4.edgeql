CREATE MIGRATION m1ip7a4kvzqxvls3xiytud7f4rmy5bumurrzwdhhi6ze6souqyjknq
    ONTO m1haonf5jzvc3othpg6lwo3p76vsmm4fkldrz32yh6bkuaqrhh42lq
{
  ALTER TYPE default::Domain {
      CREATE REQUIRED SINGLE LINK inbox: default::Inbox {
          SET REQUIRED USING (<default::Inbox>{});
      };
  };
  ALTER TYPE default::Inbox {
      CREATE REQUIRED SINGLE LINK user: default::User {
          SET REQUIRED USING (<default::User>{});
      };
  };
};
