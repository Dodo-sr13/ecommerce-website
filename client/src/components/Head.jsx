import React from "react";
import { Helmet } from "react-helmet";

const Head = ({ pageTitle }) => (
  <Helmet>
    <title>{pageTitle}</title>
    <link rel="icon" href="/images/ecommerce_8703616.png" />
    <link rel="stylesheet" href="/css/main.css" />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
    />
  </Helmet>
);

export default Head;
