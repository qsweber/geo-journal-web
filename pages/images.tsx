import React from "react";
import useSWR from "swr";

import Layout from "../components/Layout";
import { getInitialData } from "../lib/loader";

const ImagesPage = () => {
  const result = useSWR("user", getInitialData);

  const allImages = result.data ? result.data.savedImages : [];

  console.log("ImagesPage");

  return (
    <Layout loggedInUser={result.data?.user}>
      <div style={{ paddingBottom: 8 }}>
        <table>
          <tbody>
            <tr>
              <th>Name</th>
              <th>Taken</th>
              <th>Country</th>
              <th>Region</th>
              <th>Delete</th>
            </tr>
            {allImages.map((i) => {
              return (
                <tr key={i.name}>
                  <td>{i.name}</td>
                  <td>{i.takenAt.toDateString()}</td>
                  <td>{i.country}</td>
                  <td>{i.region}</td>
                  <td>
                    <button
                      onClick={(_event) => {
                        console.log(`delete ${i.name}`);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default ImagesPage;
