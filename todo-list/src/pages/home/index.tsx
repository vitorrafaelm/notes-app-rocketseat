import { Button } from "../../components/button";
import { Input } from "../../components/input";
import nookies from 'nookies'; 

import Logo from "../../assets/logo.png";
import List from "../../assets/list.png";
import styles from "./home.module.css";
import { TodoCard } from "../../components/todoCard";
import { useUser } from "../../contexts/userContext";
import { FormEvent, useEffect, useRef, useState } from "react";
import { apiFirebase } from "../../services/api";
import { useNavigate } from "react-router-dom";

export function Home(): JSX.Element {
  const { user, userNotes, listAllNotes } = useUser();
  const [isNoteBeingCreated, setIsNoteBeingCreated] = useState<boolean>(false);
  const [isLoggingOut, setIisLoggingOut] = useState<boolean>(false);
  const navigation = useNavigate();
  const noteRef = useRef<HTMLInputElement>();

  useEffect(() => {
    listAllNotes();
  }, []);

  async function handleLogout() {
    setIisLoggingOut(true); 
    nookies.destroy(null, 'auth');
    navigation("/login");
    setIisLoggingOut(false); 
  }

  async function handleCreateTask(event: FormEvent) {
    setIsNoteBeingCreated(true);
    event.preventDefault();

    if (!user) {
      throw new Error("User is not loged");
    }

    const note = noteRef.current?.value;

    const noteVerified = typeof note === "string" && note.length > 0;

    if (noteVerified) {

      await apiFirebase.post("/addNote", {
        data: {
          userId: user.id,
          taskText: note,
          token: user.token,
        },
      });
    }

    noteRef.current!.value = "";

    await listAllNotes();
    setIsNoteBeingCreated(false);
  }

  const tasksDone = userNotes.filter((task) => task.done);

  return (
    <main>
      <div className={styles.logout}>
        <Button
          title="Sair"
          style={{
            width: 90,
            height: 52,
            backgroundColor: "#DC143C",
          }}
          onClick={handleLogout}
          loading={isLoggingOut}
        />
      </div>
      <header className={styles.header}>
        <img src={Logo} alt="Logo" />

        <section className={styles.createToDosection}>
          <Input
            placeholder="Adicione uma nova tarefa"
            style={{
              width: 720,
              height: 54,
            }}
            type="text"
            required
            ref={noteRef}
          />
          <Button
            title="Criar"
            style={{
              width: 90,
              height: 52,
              backgroundColor: "#1E6F9F",
            }}
            onClick={handleCreateTask}
            loading={isNoteBeingCreated}
          />
        </section>
      </header>

      <div className={styles.content}>
        <section>
          <header>
            <div className={styles.todoQuantity}>
              <p>Tarefas criadas</p>
              <span>{userNotes.length}</span>
            </div>

            <div className={styles.todoDone}>
              <p>Concluídas</p>
              <span>
                {tasksDone.length} de {userNotes.length}
              </span>
            </div>
          </header>
        </section>

        <section className={false ? styles.todoList : styles.todoListNoBorder}>
          {false && (
            <div className={styles.voidTodoList}>
              <img src={List} alt="Void to do list" />
              <p>Você ainda não tem tarefas cadastradas</p>
              <p>Crie tarefas e organize seus itens a fazer</p>
            </div>
          )}

          {userNotes &&
            userNotes.map((note) => (
              <TodoCard
                key={note.id}
                id={note.id}
                text={note.taskText}
                done={note.done}
              />
            ))}
        </section>
      </div>
    </main>
  );
}
