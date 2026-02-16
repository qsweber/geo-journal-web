import React, { ReactNode, useEffect } from "react";

interface Props {
  children: ReactNode;
}

const Dropdown = (props: Props) => {
  useEffect(function mount() {
    window.addEventListener("click", (event) => {
      if (!((event.target as any).className as string).includes("dropbtn")) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains("show")) {
            openDropdown.classList.remove("show");
          }
        }
      }
    });
  });

  return (
    <div className="dropdown">
      <button
        onClick={(_event) => {
          document.getElementById("myDropdown")!.classList.toggle("show");
        }}
        className="dropbtn"
      >
        &#9776;
      </button>
      <div id="myDropdown" className="dropdown-content">
        {props.children}
      </div>
      <style jsx>{`
        /* Dropdown Button */
        .dropbtn {
          background-color: #3498db;
          color: white;
          padding: 2px 8px;
          font-size: 16px;
          border: none;
          cursor: pointer;
        }

        /* Dropdown button on hover & focus */
        .dropbtn:hover,
        .dropbtn:focus {
          background-color: #2980b9;
        }

        /* The container <div> - needed to position the dropdown content */
        .dropdown {
          position: relative;
          display: inline-block;
        }

        /* Dropdown Content (Hidden by Default) */
        .dropdown-content {
          display: none;
          right: 0px;
          position: absolute;
          margin-top: 2px;
          padding: 8px;
          background-color: #f1f1f1;
          min-width: 160px;
          box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
          z-index: 1;
        }

        /* Links inside the dropdown */
        .dropdown-content a {
          color: black;
          padding: 12px 16px;
          text-decoration: none;
          display: block;
        }

        /* Change color of dropdown links on hover */
        .dropdown-content a:hover {
          background-color: #ddd;
        }

        /* Show the dropdown menu (use JS to add this class to the .dropdown-content container when the user clicks on the dropdown button) */
        .show {
          display: block;
        }
      `}</style>
    </div>
  );
};

export default Dropdown;
