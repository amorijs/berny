CREATE MIGRATION m1gp77l3xj6uhrnv7cugk2cslaqffyybehzgtghgkbberslosxaeba
    ONTO m1hhikow7tyliexhsmabcxhf4ewybui5r74xmxwhgk5dfe67ybmmnq
{
  ALTER TYPE default::User {
      ALTER PROPERTY clerkId {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
