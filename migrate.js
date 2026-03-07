const fetch = require('node-fetch');

const API_URL = "https://script.google.com/macros/s/AKfycbxbEZPxGvzSj7lyMrTF4BledGplB29oeSdqt8dSWmGNT5PHhbJXeTYYQZ_plL8XYh09_Q/exec";
const PWD = "admin";

const packages = [
    {
        index: 0,
        name: "Morning Safari",
        Title: "Morning Safari",
        Time: "6:00 AM - 10:00 AM",
        Desc: "Experience the park awakening. The best time for bird watching and spotting leopards on the prowl along with the morning sunlight.",
        description: "Experience the park awakening. The best time for bird watching and spotting leopards on the prowl along with the morning sunlight.",
        Duration: "4 Hours Duration",
        Pickup: "Hotel Pick-up & Drop-off",
        Extras: "Water & Light Snacks",
        Badge: "Popular",
        Status: "ACTIVE",
        is_active: "TRUE",
        ImageURL: "https://janiruhansaga.github.io/Wild-Safari-Lank.lk/assets/peacock_safari.png"
    },
    {
        index: 1,
        name: "Evening Safari",
        Title: "Evening Safari",
        Time: "2:30 PM - 6:30 PM",
        Desc: "Witness the stunning sunset views and the majestic elephants congregating around the lakes and watering holes.",
        description: "Witness the stunning sunset views and the majestic elephants congregating around the lakes and watering holes.",
        Duration: "4 Hours Duration",
        Pickup: "Hotel Pick-up & Drop-off",
        Extras: "Water & Light Snacks",
        Badge: "",
        Status: "ACTIVE",
        is_active: "TRUE",
        ImageURL: "https://janiruhansaga.github.io/Wild-Safari-Lank.lk/assets/elephant_safari.png"
    },
    {
        index: 2,
        name: "Full-Day Safari",
        Title: "Full-Day Safari",
        Time: "6:00 AM - 6:00 PM",
        Desc: "The ultimate wildlife experience. Spend an entire day exploring deep into the national park for the highest chance of spotting a variety of wildlife.",
        description: "The ultimate wildlife experience. Spend an entire day exploring deep into the national park for the highest chance of spotting a variety of wildlife.",
        Duration: "12 Hours Duration",
        Pickup: "Hotel Pick-up & Drop-off",
        Extras: "Breakfast, Lunch & Water",
        Badge: "Ultimate",
        Status: "ACTIVE",
        is_active: "TRUE",
        ImageURL: "https://janiruhansaga.github.io/Wild-Safari-Lank.lk/assets/leopard_safari.png"
    }
];

async function migrate() {
    console.log("Starting migration to Google Sheets...");
    for (let pkg of packages) {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'updatePackage', pwd: PWD, data: pkg })
            });
            const data = await res.json();
            console.log(`Migrated ${pkg.Title}:`, data);
        } catch (e) {
            console.error(`Failed to migrate ${pkg.Title}:`, e);
        }
    }
    console.log("Migration complete.");
}

migrate();
