import Head from "next/head";
import Amplify, { API, Auth } from "aws-amplify";
import awsconfig from "../src/aws-exports";
import { getUser } from "../src/graphql/queries";
import { updateUser, createUser } from "../src/graphql/mutations";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import { faTrashAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


export default function Todo() {
  const [todos, setTodos] = useState(['Todoの操作方法', 'ドラッグしてタスクを移動', 'タスクを削除 ➝', '↓ タスクを追加']);
  const [doings, setDoings] = useState(['Sample Task X']);
  const [dones, setDones] = useState(['Sample Task Y', 'Sample Task Z']);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({name: 'Guest', photo: 'https://cdn-ak.f.st-hatena.com/images/fotolife/s/shirokumamelon/20211105/20211105010329.jpg', id: 'guest'});
  const [hoverFlag, setHoverFlag] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const [hoverStatus, setHoverStatus] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [inputFlag, setInputFlag] = useState(false);
  const [inputStatus, setInputStatus] = useState('');
  const [keyDownCode, setKeyDownCode] = useState(0);


  useEffect(() => {
    Auth.currentAuthenticatedUser()
    .then(async user => {
      setUser({name: 'User', photo: 'https://cdn-ak.f.st-hatena.com/images/fotolife/s/shirokumamelon/20211105/20211105010329.jpg', id: user.attributes.sub})
      setIsLoggedIn(true)
      const userData: any = await API.graphql({query: getUser, variables: { id: user.attributes.sub }});
      if (!userData.data.getUser) {
        createUsers(user.attributes.sub)
        .then(result => {
          // console.log('result: ', result)
        })
      } else {
        setTodos(JSON.parse(userData.data.getUser.todo))
        setDoings(JSON.parse(userData.data.getUser.doing))
        setDones(JSON.parse(userData.data.getUser.done))
      }
    })
  }, [setUser])

  function handleHoverEnter(index: number, status: string) {
    setHoverFlag(true);
    setHoverIndex(index);
    setHoverStatus(status);
  }
  function handleHoverLeave() {
    setHoverFlag(false);
    setHoverIndex(-1);
    setHoverStatus('');
  }
  function isHovering(index: number, status: string) {
    return hoverFlag && index === hoverIndex && status === hoverStatus
  }

  function showInput(status: string) {
    setInputFlag(true)
    setInputStatus(status)
  }
  function isShowing(status: string) {
    return inputFlag && status === inputStatus
  }

  function createLocalTodo(status: string) {
    if (status === 'todo') {
      const newTodo = [...todos, inputValue]
      setTodos(newTodo)
      updateUsers(newTodo, doings, dones)
    } else if (status === 'doing') {
      const newDoing = [...doings, inputValue]
      setDoings(newDoing)
      updateUsers(todos, newDoing, dones)
    } else {
      const newDone = [...dones, inputValue]
      setDones(newDone)
      updateUsers(todos, doings, newDone)
    }
    setKeyDownCode(0)
    setInputValue('')
    setInputFlag(false)
  }
  function handleKeyDown(e: any) {
    setKeyDownCode(e.keyCode)
  }
  function handleKeyUp(e: any, status: string) {
    if ( 13 == e.keyCode && e.keyCode == keyDownCode ) {
      createLocalTodo(status)
    }
  }
  function deleteLocalTodo(index: number, status: string) {
    if (status === 'todo') {
      const newTodo = todos.filter((value, i) => { return i !== index})
      setTodos(newTodo)
      updateUsers(newTodo, doings, dones)
    } else if (status === 'doing') {
      const newDoing = doings.filter((value, i) => { return i !== index})
      setDoings(newDoing)
      updateUsers(todos, newDoing, dones)
    } else {
      const newDone = dones.filter((value, i) => { return i !== index})
      setDones(newDone)
      updateUsers(todos, doings, newDone)
    }
  }

  function onDragEnd (result: any) {
    const sourceList = result.source.droppableId
    const oldIndex = result.source.index
    const newTodo = todos.slice()
    const newDoing = doings.slice()
    const newDone = dones.slice()
    if (sourceList === 'todo') {
      newTodo.splice(oldIndex, 1);
      setTodos([...newTodo])
    } else if (sourceList === 'doing') {
      newDoing.splice(oldIndex, 1)
      setDoings([...newDoing])
    } else {
      newDone.splice(oldIndex, 1)
      setDones([...newDone])
    }
    const targetList = result.destination.droppableId
    const newIndex = result.destination.index
    const title = result.draggableId
    if (targetList === 'todo') {
      newTodo.splice(newIndex, 0, title)
      setTodos([...newTodo])
    } else if (targetList === 'doing') {
      newDoing.splice(newIndex, 0, title)
      setDoings([...newDoing])
    } else {
      newDone.splice(newIndex, 0, title)
      setDones([...newDone])
    }
    updateUsers(newTodo, newDoing, newDone)
  }

  // const localRedirectSignIn = awsconfig.oauth.redirectSignIn.split(",")[0];
  // const localRedirectSignOut = awsconfig.oauth.redirectSignOut.split(",")[0];
  // const updatedawsconfig = {
  //   ...awsconfig,
  //   oauth: {
  //     ...awsconfig.oauth,
  //     redirectSignIn: localRedirectSignIn,
  //     redirectSignOut: localRedirectSignOut,
  //   },
  // };
  
  const productionRedirectSignIn = awsconfig.oauth.redirectSignIn.split(",")[1];
  const productionRedirectSignOut = awsconfig.oauth.redirectSignOut.split(",")[1];
  const updatedawsconfig = {
    ...awsconfig,
    oauth: {
      ...awsconfig.oauth,
      redirectSignIn: productionRedirectSignIn,
      redirectSignOut: productionRedirectSignOut,
    }
  }
  
  Amplify.configure(updatedawsconfig);
  
  async function createUsers(id: string) {
    try {
      const result = await API.graphql({
        query: createUser,
        variables: {
          input: {
            id: id,
            todo: JSON.stringify(todos),
            doing: JSON.stringify(doings),
            done: JSON.stringify(dones),
          },
        },
      })
      return result
    } catch (error) {
    }
  }
  async function updateUsers(todo: string[], doing: string[], done: string[]) {
    if (!isLoggedIn) { return }
    try {
      await API.graphql({
        query: updateUser,
        variables: {
          input: {
            id: user.id,
            todo: JSON.stringify(todo),
            doing: JSON.stringify(doing),
            done: JSON.stringify(done),
          },
        },
      });
    } catch (error) {
      // console.error(error);
    }
  }

  function signIn() {
    Auth.federatedSignIn({ provider: "Google" } as any)
  }
  function signOut() {
    Auth.signOut();
  }

  function getStyle(style: any, snapshot: any) {
    if (!snapshot.isDropAnimating) {
      return style;
    }
    return {
      ...style,
      transitionDuration: `0.001s`,
    };
  }

  return (
    <>
      <Head>
        <title>Nextodo</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="w-full mx-auto">
          <div className="flex justify-between items-center px-4 sm:px-6 py-4 md:justify-start md:space-x-10">
            <div className="flex justify-start items-center lg:w-0 lg:flex-1">
              <img
                className="h-7 w-auto mr-2"
                src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                alt=""
              />
              <h1 className="text-3xl font-semibold">Nextodo</h1>
            </div>
            {
              isLoggedIn ?
                <div className="md:flex items-center justify-end md:flex-1 lg:w-0">
                  <div
                    onClick={signOut}
                    className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium border-cyan-500 cursor-pointer text-cyan-500 transition-all hover:bg-cyan-500 hover:text-white hover:border-cyan-500"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-auto mr-1" />
                    Logout
                  </div>
                </div>
              :
                <div className="md:flex items-center justify-end md:flex-1 lg:w-0">
                  <div
                    onClick={signIn}
                    className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium border-red-600 cursor-pointer text-red-600 transition-all hover:bg-red-600 hover:text-white hover:border-red-600"
                  >
                    <FontAwesomeIcon icon={faGoogle} className="h-4 w-auto mr-1" />
                    Login
                  </div>
                </div>
            }
          </div>
        </div>

        <div className="w-9/12 mx-auto mt-10">
          <div className="border-b w-full flex items-center pb-5 px-4">
            <img
              className="h-24 w-auto mr-2 border rounded-full p-1 mr-5"
              src={user.photo}
              alt=""
            />
            <p className="text-4xl font-semibold">{user.name}&apos;s Todo</p>
          </div>
          <div className="grid sm:grid-cols-3 sm:gap-8 w-full h-40 p-4">
            <div>
              <div className="bg-cyan-500 text-white font-semibold p-0.5 mb-1 rounded text-xs w-10 text-center cursor-pointer">Todo</div>
              <Droppable droppableId={'todo'}>
                {provided => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="todo-container"
                  >
                    {
                      todos.map((value, index) => {
                        return <Draggable
                                  draggableId={value}
                                  index={index}
                                  key={value}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      onMouseEnter={() => {handleHoverEnter(index, 'todo')}}
                                      onMouseLeave={handleHoverLeave}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={getStyle(provided.draggableProps.style, snapshot)}
                                      ref={provided.innerRef}
                                      className="todo-card border border-gray-200 bg-white p-1.5 mb-1 rounded w-full h-11 flex items-center justify-between text-base transition-all cursor-pointer hover:shadow">
                                        {value}
                                        { isHovering(index, 'todo') && <FontAwesomeIcon
                                          icon={faTrashAlt}
                                          onClick={() => {deleteLocalTodo(index, 'todo')}}
                                          className="h-4 w-auto mr-1 text-gray-400"
                                        /> }
                                    </div>
                                    )}
                                </Draggable>
                      })
                    }
                    {provided.placeholder}
                   </div>
                 )}
               </Droppable>
              { isShowing('todo') && <input onKeyUp={(e) => {handleKeyUp(e, 'todo')}} onKeyDown={handleKeyDown} onBlur={() => {createLocalTodo('todo')}} onChange={(e) => {setInputValue(e.target.value)}} value={inputValue} type="text" className="border border-blue-500 p-1.5 mb-1 rounded w-full h-11 flex items-center text-base transition-all"/> }
              <div onClick={() => { showInput('todo') }} className="new-todo p-1.5 mb-1 rounded w-full h-11 flex items-center text-sm text-gray-500 transition-all cursor-pointer hover:shadow">＋新規</div>
            </div>
            <div>
              <div className="bg-blue-600 text-white font-semibold p-0.5 mb-1 rounded text-xs w-12 text-center cursor-pointer">Doing</div>
              <Droppable droppableId={'doing'}>
                {provided => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {
                      doings.map((value, index) => {
                        return <Draggable
                                  draggableId={value}
                                  index={index}
                                  key={value}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      onMouseEnter={() => {handleHoverEnter(index, 'doing')}}
                                      onMouseLeave={handleHoverLeave}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={getStyle(provided.draggableProps.style, snapshot)}
                                      ref={provided.innerRef}
                                      className="border border-gray-200 bg-white p-1.5 mb-1 rounded w-full h-11 flex items-center justify-between text-base transition-all cursor-pointer hover:shadow">
                                      {value}
                                        { isHovering(index, 'doing') && <FontAwesomeIcon
                                          icon={faTrashAlt}
                                          onClick={() => {deleteLocalTodo(index, 'doing')}}
                                          className="h-4 w-auto mr-1 text-gray-400"
                                        /> }
                                    </div>
                                    )}
                                </Draggable>
                      })
                    }
                    {provided.placeholder}
                   </div>
                 )}
               </Droppable>
              { isShowing('doing') && <input onKeyUp={(e) => {handleKeyUp(e, 'doing')}} onKeyDown={handleKeyDown} onBlur={() => {createLocalTodo('doing')}} onChange={(e) => {setInputValue(e.target.value)}} value={inputValue} type="text" className="border border-blue-500 p-1.5 mb-1 rounded w-full h-11 flex items-center text-base transition-all"/> }
              <div onClick={() => { showInput('doing') }} className="new-doing p-1.5 mb-1 rounded w-full h-11 flex items-center text-sm text-gray-500 transition-all cursor-pointer hover:shadow">＋新規</div>
            </div>
            <div>
              <div className="bg-green-600 text-white font-semibold p-0.5 mb-1 rounded text-xs w-10 text-center cursor-pointer">Done</div>
              <Droppable droppableId={'done'}>
                {provided => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {
                      dones.map((value, index) => {
                        return <Draggable
                                  draggableId={value}
                                  index={index}
                                  key={value}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      onMouseEnter={() => {handleHoverEnter(index, 'done')}}
                                      onMouseLeave={handleHoverLeave}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={getStyle(provided.draggableProps.style, snapshot)}
                                      ref={provided.innerRef}
                                      className="border border-gray-200 bg-white p-1.5 mb-1 rounded w-full h-11 flex items-center justify-between text-base transition-all cursor-pointer hover:shadow">
                                      {value}
                                        { isHovering(index, 'done') && <FontAwesomeIcon
                                          icon={faTrashAlt}
                                          onClick={() => {deleteLocalTodo(index, 'done')}}
                                          className="h-4 w-auto mr-1 text-gray-400"
                                        /> }
                                    </div>
                                    )}
                                </Draggable>
                      })
                    }
                    {provided.placeholder}
                   </div>
                 )}
               </Droppable>
              { isShowing('done') && <input onKeyUp={(e) => {handleKeyUp(e, 'done')}} onKeyDown={handleKeyDown} onBlur={() => {createLocalTodo('done')}} onChange={(e) => {setInputValue(e.target.value)}} value={inputValue} type="text" className="border border-blue-500 p-1.5 mb-1 rounded w-full h-11 flex items-center text-base transition-all"/> }
              <div onClick={() => { showInput('done') }} className="p-1.5 mb-1 rounded w-full h-11 flex items-center text-sm text-gray-500 transition-all cursor-pointer hover:shadow">＋新規</div>
            </div>
          </div>
        </div>
      </DragDropContext>
    </>
  );
}

