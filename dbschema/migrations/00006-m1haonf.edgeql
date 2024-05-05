CREATE MIGRATION m1haonf5jzvc3othpg6lwo3p76vsmm4fkldrz32yh6bkuaqrhh42lq
    ONTO m1f2qsegtdkki654i4q2a23xjrggq3jz6d5vxyqg2iy5behfdzjbja
{
  ALTER TYPE default::Domain {
      DROP LINK inbox;
  };
  ALTER TYPE default::Inbox {
      DROP LINK user;
  };
  ALTER TYPE default::User {
      ALTER LINK inboxes {
          SET REQUIRED USING (<default::Inbox>{});
      };
  };
};
