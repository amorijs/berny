CREATE MIGRATION m1tdmcyu7n7bvwoo6tc3vxi54al45q2c5vc2vqkzpfwi2qaaigql3q
    ONTO m1cgvpb2mwsugagg3owmu47o45i6iuwr2j3vhyjuttzth5xetmzcpq
{
  ALTER TYPE default::User {
      ALTER LINK inboxes {
          RESET OPTIONALITY;
      };
  };
};
