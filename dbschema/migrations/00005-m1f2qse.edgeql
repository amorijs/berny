CREATE MIGRATION m1f2qsegtdkki654i4q2a23xjrggq3jz6d5vxyqg2iy5behfdzjbja
    ONTO m1egozpvihnsuxhzsxyeh76qzk57xb2cjhfzq2yefeo4t6x6th5a3q
{
  ALTER TYPE default::InboxReplier {
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
          SET readonly := true;
      };
  };
};
