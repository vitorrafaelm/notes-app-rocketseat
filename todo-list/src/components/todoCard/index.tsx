import nookies from 'nookies';

import styles from "./todoCard.module.css";

import Trash from "../../assets/trash.png";
import Check from "../../assets/check.png";
import CheckDone from "../../assets/trash.png";
import { useUser } from "../../contexts/userContext";
import { apiFirebase } from "../../services/api";

interface TodoCardProps {
  id?: string;
  status?: string;
  isDeleted?: string;
  text?: string;
}

export function TodoCard({
  id,
  status,
  isDeleted,
  text,
}: TodoCardProps): JSX.Element {
  const { listAllNotes } = useUser();

  async function deleteCard() {
    const cookies = nookies.get();

    await apiFirebase.post("/deleteNoteByUser", {
      data: {
        id,
        token: cookies.auth,
      },
    });

    await listAllNotes(); 
  }

  return (
    <div className={styles.todoContainer}>
      <img src={Check} alt="" />
      <div>
        <p>{text}</p>
      </div>

      <img src={Trash} alt="" onClick={deleteCard} />
    </div>
  );
}
