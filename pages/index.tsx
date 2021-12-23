import dynamic from "next/dynamic";
const Todo = dynamic(import("../components/todo"));
import { useEffect, useState } from "react";


export default function Home() {
  const [winReady, setwinReady] = useState(false);
  useEffect(() => {
      setwinReady(true);
  }, []);
  return (
      <>
          {winReady ? <Todo /> : null}
      </>
  );
}

