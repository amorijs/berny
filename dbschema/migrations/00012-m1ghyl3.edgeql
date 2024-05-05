CREATE MIGRATION m1ghyl3niuz23g3qmvxfq3vfirlxjmjda5qsbrfhntj6kzlqyc4dfa
    ONTO m1tdmcyu7n7bvwoo6tc3vxi54al45q2c5vc2vqkzpfwi2qaaigql3q
{
  ALTER TYPE default::Domain {
      CREATE REQUIRED SINGLE LINK inbox: default::Inbox {
          SET REQUIRED USING (<default::Inbox>{});
      };
  };
  ALTER TYPE default::Inbox {
      ALTER LINK domains {
          USING (.<inbox[IS default::Domain]);
          RESET OPTIONALITY;
      };
      CREATE REQUIRED LINK user: default::User {
          SET REQUIRED USING (<default::User>{});
      };
  };
  ALTER TYPE default::User {
      ALTER LINK inboxes {
          USING (.<user[IS default::Inbox]);
      };
  };
};
