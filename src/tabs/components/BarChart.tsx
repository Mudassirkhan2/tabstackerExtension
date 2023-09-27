import React from 'react'
import { Bar } from 'react-chartjs-2'
import { useState } from 'react'
import { CategoryScale, Chart, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
const BarChart = ({ data }) => {
    console.log(data)
    function getMainSiteName(url) {
        try {
            const urlObject = new URL(url);
            return urlObject.hostname;
        } catch (error) {
            console.error(`Error extracting main site name from ${url}: ${error}`);
            return url; // Return the original URL in case of an error
        }
    }
    const [userData, setUserData] = useState({
        labels: data.filter((item) => item.clickCount !== 0).map((item) => getMainSiteName(item.url)),
        datasets: [
            {
                label: "Click Count per site of saved folder tabs",
                data: data.filter((item) => item.clickCount !== 0).map((item) => item.clickCount),
                backgroundColor: [
                    "rgba(75,192,192,1)",
                    "#ecf0f1",
                    "#50AF95",
                    "#f3ba2f",
                    "#2a71d0",
                ],
                borderColor: "black",
                borderWidth: 2,
            },
        ],
    });
    return (
        <Bar data={userData} />
    )
}

export default BarChart
