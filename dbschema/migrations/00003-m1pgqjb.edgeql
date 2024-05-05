CREATE MIGRATION m1pgqjb6eeell4zjmcrvef54s2auqaetuqgebrt5drsdoregzyymtq
    ONTO m1hcpfppmxrwee4dsuh6atdmoutkrormosxhb6wzgaqarryxkgyj3q
{
  ALTER TYPE default::Inbox {
      CREATE SINGLE LINK user: default::User;
  };
};
