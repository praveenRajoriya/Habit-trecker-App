# Habit Tracker App 📱

A personal productivity and health-tracking application built with **React Native, Expo, and TypeScript**. The goal of this project is to help users build consistent habits, monitor daily activities, and understand their progress through a simple mobile interface.

## ✨ Features

### Daily Habit Tracking
- Create and manage daily habits.
- Track habit completion.
- View progress and completion statistics.

### 💧 Water Tracker
- Track daily water intake.
- Set a daily water consumption goal.
- Record water intake in milliliters.
- View progress toward the daily goal.
- Save health data locally.

### 👟 Steps Tracker
- Track steps using Android device sensors where supported.
- View daily step progress.
- Store step history locally.
- Integrate step records with the calendar.

### 📅 Calendar
- View daily habit and step-tracking history.
- Select a date to review recorded activity.
- Identify dates with tracked activity.

### 📊 Statistics & Health Summary
- View daily habit completion.
- Review weekly habit progress.
- See overall habit statistics.
- Monitor water intake and step-goal progress.

### 🚀 Planned Features
- Native Android screen-time monitoring using Kotlin and Android's `UsageStatsManager`.
- Usage Access permission flow.
- App-wise screen-time breakdown.
- Daily screen-time goals and usage history.
- Focus timer and digital wellbeing statistics.

> **Note:** Native screen-time monitoring is planned and is not yet confirmed as implemented. It will require an Android development build and user-granted Usage Access.

## 🛠️ Tech Stack

- **React Native** — Mobile application framework
- **Expo** — Development tooling and build workflow
- **TypeScript** — Type-safe JavaScript
- **Expo Router** — File-based navigation
- **AsyncStorage** — Local data persistence
- **Expo Sensors** — Step-counting functionality where supported
- **Kotlin / Android APIs** — Planned native Android screen-time integration

## 📂 Project Structure

```text
HabitTracker/
├── app/
│   ├── _layout.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── calendar.tsx
│       ├── stats.tsx
│       └── settings.tsx
├── components/
│   ├── WaterTracker.tsx
│   └── StepsTracker.tsx
├── context/
│   ├── HabitContext.tsx
│   └── HealthContext.tsx
├── assets/
├── package.json
└── README.md
```

*The structure above describes the current known project files. Your actual project may contain additional files.*

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm
- Expo Go for supported Expo features
- An Android phone for device testing
- An Expo account if using EAS cloud builds

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/HabitTracker.git
```

### 2. Open the project

```bash
cd HabitTracker
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the Expo development server

```bash
npx expo start
```

Scan the QR code with Expo Go to run the app when its features are supported by Expo Go.

> Custom native Android modules require a development build rather than Expo Go.

## 💾 Data Storage

The application uses AsyncStorage to persist supported habit and health-tracking data locally on the device. Step history is stored by date.

Local storage is device-specific and does not automatically synchronize data across devices.

## 🔐 Permissions

Step tracking may require device sensor support and appropriate permissions.

The planned native screen-time feature will require the user to enable Android's **Usage Access** setting. The app should explain why this access is needed and request it through Android settings.

## 🗺️ Roadmap

- [x] Daily habit tracking
- [x] Water intake tracking
- [x] Step tracking
- [x] Calendar integration for recorded steps
- [x] Habit statistics and health summary
- [ ] Native Android screen-time tracking
- [ ] Focus timer
- [ ] Digital wellbeing summary
- [ ] Additional statistics and improvements

## 🎯 Project Goal

The goal is to develop a practical all-in-one mobile application for habit building, daily activity tracking, and personal productivity while learning React Native, Expo, TypeScript, and native Android development.

## 🤝 Contributing

Suggestions, bug reports, and contributions are welcome. Feel free to open an issue or submit a pull request.

## 📄 License

No license has been specified yet. Add a license file if you intend to define permissions for using, modifying, and distributing this project.

---

**Built with React Native, Expo, and TypeScript ❤️**