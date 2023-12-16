"use client";
import { useState } from "react";
import * as supa from "/app/supabase.service";
import { uuid } from "short-uuid";

export default function Home() {
  const [subscribers, setSubscribers] = useState(null);
  const [IDs, setIDs] = useState(null);
  const [groups, setGroups] = useState(null);
  const [groups_subs, setGroups_subs] = useState(null);
  const [general_subs, setGeneral_subs] = useState(null);

  return (
    <main className="flex min-h-screen flex-col items-center gap-10 p-24">
      {/* addToDB test */}
      <button
        onClick={() => {
          supa.addToDB("SUBSCRIBERS", {
            id: uuid(),
            first_name: "Franco",
            last_name: "Aguirre",
            email: "email@email.com",
            phone_number: "1126590757",
          });

          supa.addToDB("SUBSCRIBERS", {
            id: uuid(),
            first_name: "Chris",
            last_name: "Awoke",
            email: "email2@email.com",
            phone_number: "1126590754",
          });
        }}
      >
        addToDB
      </button>

      {/* readAllDB test */}
      <button
        onClick={async () => {
          const subs = await supa.readAllDB("SUBSCRIBERS");
          setSubscribers(subs);
        }}
      >
        readAllDB
      </button>
      {/* Show readAllDb results */}
      <div className="flex flex-col gap-1">
        <h2>Subscribers table</h2>
        {subscribers?.map((sub) => (
          <p key={sub.id}>
            {sub.id} | {sub.first_name} | {sub.email}
          </p>
        ))}
      </div>

      {/* Delete the element from subscribers with the email "email@email.com" */}
      <button
        onClick={() => {
          supa.deleteDBData("SUBSCRIBERS", "email", "email@email.com");
        }}
      >
        deleteDBData
      </button>

      {/* fetchID from the subscriber with the email "email@email.com" */}
      <button
        onClick={async () => {
          const fetchedID = await supa.fetchID(
            "SUBSCRIBERS",
            "email",
            "email2@email.com"
          );
          setIDs(fetchedID);
        }}
      >
        fetchID
      </button>

      {/* Show the fetchedID */}
      <div>
        <h2>Fetched ID</h2>
        <p>{IDs && IDs?.map((id) => id.id)}</p>
      </div>

      {/* createGroup test */}
      <section className="flex gap-2">
        <button
          onClick={() => {
            supa.createGroup({ id: uuid(), name: "Test group" });
          }}
        >
          createGroup
        </button>

        <button
          onClick={async () => {
            const groups = await supa.readAllDB("GROUPS");
            setGroups(groups);
          }}
        >
          readGroups
        </button>
      </section>

      {/* Show groups */}
      <div className="flex flex-col gap-1">
        <h2>Groups table</h2>
        {groups?.map((group) => (
          <p key={group.id}>
            {group.id} | {group.name}
          </p>
        ))}
      </div>

      {/* addSubscriber test, should automatically relate the created subscriber to the general group in the
      SUBSCRIBERS_GROUPS table */}
      <button
        onClick={() => {
          supa.addSubscriber({
            id: uuid(),
            first_name: "This subscriber",
            last_name: "Should be on general",
            email: "fake@email.com",
            phone_number: "1111111111",
          });
        }}
      >
        addSubscriber
      </button>

      {/* We will now read related data, our objective is to get only the subscribers that are in the general group */}
      <button
        onClick={async () => {
          // Read the SUBSCRIBERS table
          const subs = await supa.readAllDB("SUBSCRIBERS");
          setSubscribers(subs);

          // Read the relational table GROUPS_SUBSCRIBERS
          const groups_subs = await supa.readAllDB("GROUPS_SUBSCRIBERS");
          setGroups_subs(groups_subs);

          // Read only the subs on the general group, I want it to return a list with all the subs that fulfill the condition
          //and I want it to return only the id, first_name and last_name of the subs
          const general_subs = await supa.readRelatedData(
            "GROUPS",
            "general",
            "SUBSCRIBERS",
            "id, first_name, last_name"
          );
          setGeneral_subs(general_subs);
          console.log(general_subs);
        }}
      >
        readTables
      </button>
      <section className="flex flex-col gap-5">
        {/* Show SUBSCRIBERS table */}
        <div className="flex flex-col gap-1">
          <h2>SUBSCRIBERS</h2>
          {subscribers?.map((sub) => (
            <p key={sub.id}>
              {sub.id} | {sub.first_name} {sub.last_name}
            </p>
          ))}
        </div>

        {/* Show GROUPS_SUBSCRIBERS table */}
        <div className="flex flex-col gap-1">
          <h2>GROUPS_SUBSCRIBERS</h2>
          <p>group_id | subscriber_id</p>
          {groups_subs?.map((group_sub) => (
            <p key={group_sub.group_id}>
              {group_sub.group_id} | {group_sub.subscriber_id}
            </p>
          ))}
        </div>

        {/* Show GROUPS_SUBSCRIBERS table */}
        <div className="flex flex-col gap-1">
          <h2>SUBSCRIBERS IN GENERAL GROUP</h2>
          {general_subs &&
            general_subs[0]?.SUBSCRIBERS?.map((gen_sub) => (
              <p key={gen_sub.id}>
                {gen_sub.id} | {gen_sub.first_name} {gen_sub.last_name}
              </p>
            ))}
        </div>
      </section>
    </main>
  );
}
