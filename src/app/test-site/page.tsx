"use client";

import { useEffect } from "react";
import Image from "next/image";

const cars = [
	{
		id: 1,
		name: "Nissan Qashqai",
		desc: "1.3 DIG-T MH N-Design 5dr",
		year: 2025,
		miles: "50 Miles",
		fuel: "Petrol",
		trans: "Manual",
		price: "£28,599",
		pcp: "£426",
		img: "/uploads/test-site/IMG-20250521-WA0001-1024x768.jpg",
	},
	{
		id: 2,
		name: "Ford Fiesta",
		desc: "1.0 EcoBoost Hybrid MHEV 155 ST-Line X Edition 5dr",
		year: 2020,
		miles: "19,898 Miles",
		fuel: "Petrol",
		trans: "Manual",
		price: "£13,094",
		pcp: "£198",
		img: "/uploads/test-site/IMG-20250521-WA0002-1024x768.jpg",
		reserved: true,
	},
	{
		id: 3,
		name: "Volkswagen Golf",
		desc: "1.5 TSI Style 5dr",
		year: 2021,
		miles: "42,553 Miles",
		fuel: "Petrol",
		trans: "Manual",
		price: "£16,644",
		pcp: "£257",
		img: "/uploads/test-site/IMG-20250521-WA0003-1024x768.jpg",
	},
	{
		id: 4,
		name: "Volvo XC90",
		desc: "2.0 T8 PHEV Ultra Bright 5dr AWD Geartronic",
		year: 2024,
		miles: "1,776 Miles",
		fuel: "Petrol Plug-In Hybrid",
		trans: "Automatic",
		price: "£70,954",
		pcp: "£1,159",
		img: "/uploads/test-site/IMG-20250521-WA0004-1024x768.jpg",
	},
	{
		id: 5,
		name: "Ford EcoSport",
		desc: "1.0 EcoBoost 125 ST-Line 5dr",
		year: 2019,
		miles: "46,941 Miles",
		fuel: "Petrol",
		trans: "Manual",
		price: "£10,249",
		pcp: "£141",
		img: "/uploads/test-site/IMG-20250521-WA0151-1024x768.jpg",
	},
	{
		id: 6,
		name: "Peugeot 208",
		desc: "1.2 PureTech Allure 5dr",
		year: 2022,
		miles: "8,500 Miles",
		fuel: "Petrol",
		trans: "Manual",
		price: "£15,995",
		pcp: "£210",
		img: "/uploads/test-site/IMG-20250521-WA0047-1024x768.jpg",
	},
	{
		id: 7,
		name: "BMW 3 Series",
		desc: "320i M Sport 4dr Step Auto",
		year: 2021,
		miles: "21,000 Miles",
		fuel: "Petrol",
		trans: "Automatic",
		price: "£27,450",
		pcp: "£399",
		img: "/uploads/test-site/IMG-20250521-WA0048-1024x768.jpg",
	},
	{
		id: 8,
		name: "Audi A1",
		desc: "1.0 TFSI 30 Sport 5dr",
		year: 2020,
		miles: "15,200 Miles",
		fuel: "Petrol",
		trans: "Manual",
		price: "£14,750",
		pcp: "£189",
		img: "/uploads/test-site/IMG-20250521-WA0049-1024x768.jpg",
	},
	{
		id: 9,
		name: "Hyundai Tucson",
		desc: "1.6 TGDi SE Connect 5dr 2WD",
		year: 2023,
		miles: "3,200 Miles",
		fuel: "Petrol",
		trans: "Manual",
		price: "£23,995",
		pcp: "£320",
		img: "/uploads/test-site/IMG-20250521-WA0050-1024x768.jpg",
	},
];

export default function TestSite() {
	useEffect(() => {
		const script = document.createElement("script");
		script.src = "/js/adsend.js";
		script.async = true;
		script.setAttribute("data-property", "1748097664905-bru87g"); // Use your propertyId
		document.body.appendChild(script);
		return () => {
			document.body.removeChild(script);
		};
	}, []);

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-2 flex flex-col items-center">
			<h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
				Car Marketplace Test Site
			</h1>

			{/* Preset Banner Slot 1 */}
			<div id="banner-slot-1" className="w-full max-w-5xl mb-6 flex items-center justify-center min-h-[90px] bg-transparent rounded-xl text-purple-700 dark:text-purple-200 text-sm font-semibold">
				Banner Slot 1 (id="banner-slot-1")
			</div>

			<div className="ad-slot grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl w-full">
				{cars.map((car) => (
					<div
						key={car.id}
						className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 flex flex-col relative border border-gray-100 dark:border-gray-700"
					>
						<span className="absolute top-3 right-4 text-xs text-purple-500 font-bold">
							cinch
						</span>
						{car.reserved && (
							<span className="absolute top-3 left-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs px-2 py-1 rounded font-semibold">
								Reserved
							</span>
						)}
						<div className="w-full aspect-[4/2] relative mb-3">
							<Image
								src={car.img}
								alt={car.name}
								fill
								className="object-cover rounded-xl"
							/>
						</div>
						<div className="font-bold text-lg mb-1 text-gray-900 dark:text-gray-100">{car.name}</div>
						<div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{car.desc}</div>
						<div className="flex flex-wrap gap-2 mb-2 text-xs">
							<span className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-gray-900 dark:text-gray-100">
								{car.year}
							</span>
							<span className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-gray-900 dark:text-gray-100">
								{car.miles}
							</span>
							<span className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-gray-900 dark:text-gray-100">
								{car.fuel}
							</span>
							<span className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-gray-900 dark:text-gray-100">
								{car.trans}
							</span>
						</div>
						<div className="flex items-end justify-between mt-auto">
							<div>
								<div className="text-xl font-bold text-gray-900 dark:text-gray-100">{car.price}</div>
								<div className="text-xs text-gray-500 dark:text-gray-400">
									Includes £99 admin fee
								</div>
							</div>
							<div className="text-right">
								<div className="text-base font-semibold text-gray-900 dark:text-gray-100">{car.pcp}</div>
								<div className="text-xs text-gray-500 dark:text-gray-400">48 month PCP</div>
							</div>
						</div>
						<div className="flex gap-2 mt-3">
							<label className="flex items-center gap-1 text-xs cursor-pointer text-gray-900 dark:text-gray-100">
								<input
									type="checkbox"
									className="accent-green-500"
								/> {" "}
								Compare
							</label>
							<label className="flex items-center gap-1 text-xs cursor-pointer text-gray-900 dark:text-gray-100">
								<input
									type="checkbox"
									className="accent-green-500"
								/> {" "}
								Finance quote
							</label>
						</div>
						<button className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full p-2 shadow text-purple-500 hover:bg-purple-50 dark:hover:bg-gray-700 transition">
							<svg
								width="20"
								height="20"
								fill="none"
								viewBox="0 0 24 24"
							>
								<path
									d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
									stroke="currentColor"
									strokeWidth="2"
								/>
							</svg>
						</button>
					</div>
				))}
			</div>

			{/* Preset Banner Slot 2 */}
			<div id="banner-slot-2" className="w-full max-w-5xl mt-6 flex items-center justify-center min-h-[90px] bg-transparent rounded-xl text-purple-700 dark:text-purple-200 text-sm font-semibold">
				Banner Slot 2 (id="banner-slot-2")
			</div>
		</div>
	);
}
