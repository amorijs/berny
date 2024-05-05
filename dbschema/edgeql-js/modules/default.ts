// GENERATED by @edgedb/generate v0.5.3

import * as $ from "../reflection";
import * as _ from "../imports";
import type * as _std from "./std";
export type $DomainλShape = $.typeutil.flatten<_std.$Object_8ce8c71ee4fa5f73840c22d7eaa58588λShape & {
  "createdAt": $.PropertyDesc<_std.$datetime, $.Cardinality.One, false, false, true, true>;
  "name": $.PropertyDesc<_std.$str, $.Cardinality.One, false, false, false, false>;
  "inbox": $.LinkDesc<$Inbox, $.Cardinality.One, {}, false, false,  false, false>;
  "<domains[is Inbox]": $.LinkDesc<$Inbox, $.Cardinality.Many, {}, false, false,  false, false>;
  "<domains": $.LinkDesc<$.ObjectType, $.Cardinality.Many, {}, false, false,  false, false>;
}>;
type $Domain = $.ObjectType<"default::Domain", $DomainλShape, null, [
  ..._std.$Object_8ce8c71ee4fa5f73840c22d7eaa58588['__exclusives__'],
]>;
const $Domain = $.makeType<$Domain>(_.spec, "95333e21-0a9c-11ef-ba47-39f8d00079f4", _.syntax.literal);

const Domain: $.$expr_PathNode<$.TypeSet<$Domain, $.Cardinality.Many>, null> = _.syntax.$PathNode($.$toSet($Domain, $.Cardinality.Many), null);

export type $InboxλShape = $.typeutil.flatten<_std.$Object_8ce8c71ee4fa5f73840c22d7eaa58588λShape & {
  "email": $.PropertyDesc<_std.$str, $.Cardinality.One, true, false, false, false>;
  "icon": $.PropertyDesc<_std.$str, $.Cardinality.AtMostOne, false, false, false, false>;
  "mailslurpInboxId": $.PropertyDesc<_std.$str, $.Cardinality.One, true, false, false, false>;
  "createdAt": $.PropertyDesc<_std.$datetime, $.Cardinality.One, false, false, true, true>;
  "domains": $.LinkDesc<$Domain, $.Cardinality.Many, {}, false, true,  false, false>;
  "user": $.LinkDesc<$User, $.Cardinality.One, {}, false, false,  false, false>;
  "<inbox[is Domain]": $.LinkDesc<$Domain, $.Cardinality.Many, {}, false, false,  false, false>;
  "<inboxes[is User]": $.LinkDesc<$User, $.Cardinality.Many, {}, false, false,  false, false>;
  "<inbox": $.LinkDesc<$.ObjectType, $.Cardinality.Many, {}, false, false,  false, false>;
  "<inboxes": $.LinkDesc<$.ObjectType, $.Cardinality.Many, {}, false, false,  false, false>;
}>;
type $Inbox = $.ObjectType<"default::Inbox", $InboxλShape, null, [
  ..._std.$Object_8ce8c71ee4fa5f73840c22d7eaa58588['__exclusives__'],
  {mailslurpInboxId: {__element__: _std.$str, __cardinality__: $.Cardinality.One | $.Cardinality.AtMostOne },},
  {email: {__element__: _std.$str, __cardinality__: $.Cardinality.One | $.Cardinality.AtMostOne },},
]>;
const $Inbox = $.makeType<$Inbox>(_.spec, "950ddd8d-0a9c-11ef-8188-6b8a6dc951b2", _.syntax.literal);

const Inbox: $.$expr_PathNode<$.TypeSet<$Inbox, $.Cardinality.Many>, null> = _.syntax.$PathNode($.$toSet($Inbox, $.Cardinality.Many), null);

export type $UserλShape = $.typeutil.flatten<_std.$Object_8ce8c71ee4fa5f73840c22d7eaa58588λShape & {
  "email": $.PropertyDesc<_std.$str, $.Cardinality.One, true, false, false, false>;
  "clerkId": $.PropertyDesc<_std.$str, $.Cardinality.One, true, false, false, false>;
  "createdAt": $.PropertyDesc<_std.$datetime, $.Cardinality.One, false, false, true, true>;
  "inboxes": $.LinkDesc<$Inbox, $.Cardinality.Many, {}, false, true,  false, false>;
  "<user[is Inbox]": $.LinkDesc<$Inbox, $.Cardinality.Many, {}, false, false,  false, false>;
  "<user": $.LinkDesc<$.ObjectType, $.Cardinality.Many, {}, false, false,  false, false>;
}>;
type $User = $.ObjectType<"default::User", $UserλShape, null, [
  ..._std.$Object_8ce8c71ee4fa5f73840c22d7eaa58588['__exclusives__'],
  {clerkId: {__element__: _std.$str, __cardinality__: $.Cardinality.One | $.Cardinality.AtMostOne },},
  {email: {__element__: _std.$str, __cardinality__: $.Cardinality.One | $.Cardinality.AtMostOne },},
]>;
const $User = $.makeType<$User>(_.spec, "950eec87-0a9c-11ef-b37b-6b42b2d25853", _.syntax.literal);

const User: $.$expr_PathNode<$.TypeSet<$User, $.Cardinality.Many>, null> = _.syntax.$PathNode($.$toSet($User, $.Cardinality.Many), null);



export { $Domain, Domain, $Inbox, Inbox, $User, User };

type __defaultExports = {
  "Domain": typeof Domain;
  "Inbox": typeof Inbox;
  "User": typeof User
};
const __defaultExports: __defaultExports = {
  "Domain": Domain,
  "Inbox": Inbox,
  "User": User
};
export default __defaultExports;
