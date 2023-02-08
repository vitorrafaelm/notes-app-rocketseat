import nookies from "nookies";
import { SpinnerCircular } from "spinners-react";

import styles from "./todoCard.module.css";

import Trash from "../../assets/trash.png";
import Check from "../../assets/check.png";
import CheckDone from "../../assets/checkDone.png";
import { useUser } from "../../contexts/userContext";
import { apiFirebase } from "../../services/api";
import { useState } from "react";

interface TodoCardProps {
  id?: string;
  done?: boolean;
  isDeleted?: string;
  text?: string;
}

export function TodoCard({
  id,
  done,
  isDeleted,
  text,
}: TodoCardProps): JSX.Element {
  const { listAllNotes } = useUser();
  const [noteStatus, setNoteStatus] = useState<boolean | undefined>(done); 
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const cookies = nookies.get();

  async function deleteCard() {
    setIsDeleting(true);
    
    await apiFirebase.post("/deleteNoteByUser", {
      data: {
        id,
        token: cookies.auth,
      },
    });

    await listAllNotes();
    setIsDeleting(false);
  }

  async function changeNoteState() {
    setNoteStatus(prev => !prev); 

    await apiFirebase.post("/changeNoteStatus", {
      data: {
        id,
        token: cookies.auth,
        done: !noteStatus,
      },
    });

    await listAllNotes();
  }

  return (
    <div className={styles.todoContainer}>
      <img src={noteStatus ? CheckDone : Check} alt="" onClick={() => changeNoteState()} />
      <div>
        <p>{text}</p>
      </div>
      {isDeleting ? (
        <SpinnerCircular size={26} />
      ) : (
        <img src={Trash} alt="" onClick={deleteCard} />
      )}
    </div>
  );
}
