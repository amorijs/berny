CREATE MIGRATION m1cgvpb2mwsugagg3owmu47o45i6iuwr2j3vhyjuttzth5xetmzcpq
    ONTO m1ss7q52u4dtzpzla2qzbblhvadydzj3qyrxw3ibkx4c6niazf47tq
{
  ALTER TYPE default::Inbox {
      ALTER PROPERTY email {
          CREATE CONSTRAINT std::exclusive;
      };
      ALTER PROPERTY mailslurpInboxId {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
