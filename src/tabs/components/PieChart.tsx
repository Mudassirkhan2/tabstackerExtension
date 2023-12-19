import React from 'react'
import { Pie } from 'react-chartjs-2'
import { useState } from 'react'
import { CategoryScale, Chart, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { ArcElement } from "chart.js";

Chart.register(ArcElement);
Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
const PieChart = ({ data }) => {
    console.log("data", data)
    console.log(data.map((item) => item.folderName))
    console.log(data.map((item) => item.timeSpent))
    const [userData, setUserData] = useState({
        labels: data.map((item) => item.folderName),
        datasets: [
            {
                label: "Time Spent per site of saved folder tabs",
                data: data.map((item) => item.timeSpent),
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
        <Pie data={userData} />
    )
}

export default PieChart
