/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aid_applications from "../aid_applications.js";
import type * as auth from "../auth.js";
import type * as beneficiaries from "../beneficiaries.js";
import type * as donations from "../donations.js";
import type * as finance_records from "../finance_records.js";
import type * as meetings from "../meetings.js";
import type * as messages from "../messages.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  aid_applications: typeof aid_applications;
  auth: typeof auth;
  beneficiaries: typeof beneficiaries;
  donations: typeof donations;
  finance_records: typeof finance_records;
  meetings: typeof meetings;
  messages: typeof messages;
  tasks: typeof tasks;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
