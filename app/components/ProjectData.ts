// File: app/components/ProjectData.ts

export interface TechStack {
    name: string;
    logo: string;
    url: string;
  }
  
  export interface Project {
    name: string;
    year: number;
    video: string;
    techStack: TechStack[];
  }
  
  export const projects: Project[] = [
    {
      name: "LSA Course",
      year: 2025,
      video: "/video/lsa-course.webm",
      techStack: [
        {
          name: "NextJS",
          logo: "/logos/nextjs.png",
          url: "https://nextjs.org",
        },
        {
          name: "MongoDB",
          logo: "/logos/mongodb.png",
          url: "https://mongodb.com",
        },
        {
          name: "Mixtral",
          logo: "/logos/mixtral.png",
          url: "https://mixtral.ai",
        },
        {
          name: "ThreeJS",
          logo: "/logos/threejs.png",
          url: "https://threejs.org",
        },
      ],
    },
    {
      name: "Workout AI",
      year: 2024,
      video: "/video/workout-ai.webm",
      techStack: [
        {
          name: "Dart",
          logo: "/logos/dart.png",
          url: "https://dart.dev",
        },
        {
          name: "Flutter",
          logo: "/logos/flutter.png",
          url: "https://flutter.dev",
        },
        {
          name: "MLKit",
          logo: "/logos/mlkit.png",
          url: "https://firebase.google.com/docs/ml-kit",
        },
        {
          name: "MongoDB",
          logo: "/logos/mongodb.png",
          url: "https://mongodb.com",
        },
      ],
    },
    {
      name: "EWS Earthquake",
      year: 2024,
      video: "/video/ews-earthquake.webm",
      techStack: [
        {
          name: "React Native",
          logo: "/logos/react.png",
          url: "https://reactnative.dev",
        },
        {
          name: "TypeScript",
          logo: "/logos/typescript.png",
          url: "https://www.typescriptlang.org",
        },
        {
          name: "Firebase Realtime Database",
          logo: "/logos/firebase.png",
          url: "https://firebase.google.com/docs/database",
        },
        {
          name: "Mapbox",
          logo: "/logos/mapbox.png",
          url: "https://www.mapbox.com",
        },
        {
          name: "BMKG API",
          logo: "/logos/bmkg.png",
          url: "https://data.bmkg.go.id",
        },
      ],
    },
    {
      name: "Surveyor Pilkada",
      year: 2024,
      video: "/video/surveyor-pilkada.webm",
      techStack: [
        {
          name: "React Native",
          logo: "/logos/react.png",
          url: "https://reactnative.dev",
        },
        {
          name: "TypeScript",
          logo: "/logos/typescript.png",
          url: "https://www.typescriptlang.org",
        },
        {
          name: "Redux",
          logo: "/logos/redux.png",
          url: "https://redux.js.org",
        },
        {
          name: "Socket.io",
          logo: "/logos/socket.png",
          url: "https://socket.io",
        },
        {
          name: "Google Maps",
          logo: "/logos/googlemap.png",
          url: "https://maps.google.com",
        },
      ],
    },
    {
      name: "Gomoku Game",
      year: 2023,
      video: "/video/gomoku-game.webm",
      techStack: [
        {
          name: "React",
          logo: "/logos/react.png",
          url: "https://reactjs.org",
        },
        {
          name: "JavaScript",
          logo: "/logos/javascript.png",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        },
        {
          name: "Firebase Realtime Database",
          logo: "/logos/firebase.png",
          url: "https://firebase.google.com",
        },
      ],
    },
    {
      name: "Parion",
      year: 2023,
      video: "/video/parion.webm",
      techStack: [
        {
          name: "NextJS",
          logo: "/logos/nextjs.png",
          url: "https://nextjs.org",
        },
        {
          name: "MongoDB",
          logo: "/logos/mongodb.png",
          url: "https://mongodb.com",
        },
        {
          name: "Xendit",
          logo: "/logos/xendit.png",
          url: "https://xendit.co",
        },
        {
          name: "OpenAI",
          logo: "/logos/openai.png",
          url: "https://openai.com",
        },
        {
          name: "Firestore",
          logo: "/logos/firebase.png",
          url: "https://firebase.google.com/docs/firestore",
        },
      ],
    },
  ];
  
  export default projects;