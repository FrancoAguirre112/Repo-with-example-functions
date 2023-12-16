import { createClient } from "@supabase/supabase-js";

//TODO:Replace with the nextjs way of importing before deploy
// export const supabase = createClient(
//   import.meta.env.VITE_SUPA_REST_URL,
//   import.meta.env.VITE_SUPA_ANON_KEY
// );

//TODO:Replace with env var call before deploy
export const supabase = createClient(
  "https://uqehjvabrmmtkziwgkuw.supabase.co/",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxZWhqdmFicm1tdGt6aXdna3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE3MDUzODEsImV4cCI6MjAxNzI4MTM4MX0.2UOibWpxRlxHy6hKyH9bZz3s9G2sfaKh8bUkmE9e55E"
);

//Adds data to a table given it's name
export const addToDB = async (tableName, dbData) => {
  const { error } = await supabase.from(tableName).insert([dbData]).select();

  if (error) throw error;
};

//Simply reads all the data from a table given it's name
export const readAllDB = async (tableName) => {
  const { data, error } = await supabase.from(tableName).select("*");
  if (error) {
    throw error;
  }

  return data;
};

//Deletes a row based on the value of one of its columns
export const deleteDBData = async (tableName, columnName, columnValue) => {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq(columnName, columnValue);

  if (error) {
    throw error;
  }

  console.log("Deletion successful");
};

// Returns related data from one table (fromTable) based on a specified value (fromValueName) in the "name" column.
// It selects all columns from the specified table (selectedTable) and additional data specified in selectedData,
// where the value in the "name" column matches the provided fromValueName.
// If successful, it returns the retrieved data; otherwise, it throws an error.
export const readRelatedData = async (
  fromTable,
  fromValueName,
  selectedTable,
  selectedData
) => {
  const { data, error } = await supabase
    .from(fromTable)
    .select(`*, ${selectedTable} (${selectedData})`)
    .eq("name", fromValueName);

  if (error) throw error;
  console.log(data);
  return data;
};

//Fetches the id of one value given the tableName where it is located, the column we wan't to identify it for
//and which value that column should have. ex: "GROUPS", "name", "general" will fetch the id of the general group
export const fetchID = async (tableName, column, columnValue) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select("id")
      .eq(column, columnValue);

    if (error) {
      console.error("Error fetching ID:", error);
      return null;
    }

    //Since we don't know if the users are going to register more than one, there might be duplicated people in the database with
    //different data, so this will return an array of id's just in case for example we ask for the id of a subscriber with the email "email@email.com" and there are multiple
    return data;
  } catch (error) {
    console.error("Error fetching ID:", error.message);
    return null;
  }
};

//Creates a group given a group object { id:uuid() , name:string }
export const createGroup = (group) => {
  addToDB("GROUPS", group);
};

//Adds a subscriber to a group given the subscriber email and the group name
export const addSubscriberToGroup = async (subscriberID, groupName) => {
  try {
    //We fetch the id from the specified group
    const groups = await fetchID("GROUPS", "name", groupName);

    //add the group_id and subscriber_id to the GROUPS_SUBSCRIBERS table to make them related

    addToDB("GROUPS_SUBSCRIBERS", {
      group_id: groups[0].id, // Assuming groups are unique
      subscriber_id: subscriberID,
    });
  } catch (error) {
    console.error("Error adding subscriber to group:", error);
    // Handle error or throw it further if necessary
  }
};

//Adds a subscriber to our database, also adds it to the general subscriber group by default
export const addSubscriber = (subscriber) => {
  //We add the subscriber to the SUBSCRIBERS table
  addToDB("SUBSCRIBERS", subscriber);

  //We add the subscriber the general group by default
  addSubscriberToGroup(subscriber.id, "general");
};
