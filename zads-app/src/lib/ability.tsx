"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  createMongoAbility,
  type MongoAbility,
  type RawRuleOf,
} from "@casl/ability";
import { useSession } from "next-auth/react";

type Actions = "manage" | "read" | "create" | "update" | "delete";
type Subjects =
  | "all"
  | "Client"
  | "Dependents"
  | "TutorRequest"
  | "ContactRequest"
  | "Favorites"
  | "Teacher"
  | "TeacherSubject"
  | "Admin";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

function defineRulesFor(userType: string): RawRuleOf<AppAbility>[] {
  switch (userType) {
    case "ADMIN":
      return [{ action: "manage", subject: "all" }];

    case "parent": // API enum keeps "parent"; product label is "client/learner"
      return [
        { action: "read", subject: "Client" },
        { action: "manage", subject: "Dependents" },
        { action: "manage", subject: "TutorRequest" },
        { action: "manage", subject: "ContactRequest" },
        { action: "manage", subject: "Favorites" },
        { action: "read", subject: "Teacher" },
      ];

    case "TEACHER":
      return [
        { action: "read", subject: "Teacher" },
        { action: "manage", subject: "TeacherSubject" },
        { action: "read", subject: "TutorRequest" },
        { action: "manage", subject: "ContactRequest" },
      ];

    default:
      return [];
  }
}

const AbilityContext = createContext<AppAbility>(createMongoAbility<[Actions, Subjects]>([]));

export function AbilityProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [ability, setAbility] = useState<AppAbility>(() => createMongoAbility<[Actions, Subjects]>([]));

  useEffect(() => {
    const rules = defineRulesFor(session?.userType ?? "");
    setAbility(createMongoAbility<[Actions, Subjects]>(rules));
  }, [session?.userType]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

export function useAbility(): AppAbility {
  return useContext(AbilityContext);
}
