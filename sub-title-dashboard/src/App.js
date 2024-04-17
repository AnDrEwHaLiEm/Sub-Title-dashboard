import React, { useState, useEffect } from 'react';
import './App.css';
import SubtitleComponent from './SubTitle';
import { El_3ed } from './data/data';
import { axiosApis } from './API/axiosSetup';
const App = () => {
  const [subtitles, setSubtitles] = useState(["Andrew Haliem", "اندرو حليم"]);
  const [currentLevel, setCurrentLevel] = useState(0); // رفع البخور تقديم الحمل
  const [childIndex, setChildIndex] = useState(0); // ابانا الذى فلنشكر صانع الخيرات
  const [currentIndex, setCurrentIndex] = useState(0); // index of subtitle
  const [socket, setSocket] = useState(null);


  useEffect(() => {
    const newSocket = new WebSocket('ws://192.168.1.13:8080');
    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, []);

  const updateSubtitle = (data, index) => {
    setCurrentIndex(index);
    console.log({ data, index });
    if (socket) {
      socket.send(JSON.stringify({ action: 'updateSubtitle', message_1: data[index], message_2: data[index + 1] }));
    }
  };


  const getSubtitles = (path) => {
    const data = axiosApis.get(`/?path=${path}`)
      .then((response) => {
        setSubtitles(response.data);
        console.log({ data: response.data });
        setCurrentIndex(0);
        return response.data;
      })
      .catch((error) => {
        console.log(error);
      });
    return data;
  }

  const handleItemClick = (path, levelIndex, childIndex) => {
    return async (e) => {
      e.preventDefault();
      console.log({ path, levelIndex, childIndex });
      const data = await getSubtitles(path);
      setChildIndex(childIndex);
      setCurrentLevel(levelIndex);
      updateSubtitle(data, 0);
    }
  }




  const getNextChild = async (levelIndex, index) => {
    console.log("Enter getNextChild", levelIndex, index);
    let currentChildIndex = index;
    while (currentChildIndex <= El_3ed[levelIndex].children.length - 1) {

      if (El_3ed[levelIndex].children[currentChildIndex].active) {
        const data = await getSubtitles(El_3ed[levelIndex].children[currentChildIndex].path);
        setChildIndex(currentChildIndex);
        updateSubtitle(data, 0);
        return true;
      }
      currentChildIndex++;
    }
    console.log("Not found active child");
    return false;
  };

  const getNextLevel = async () => {
    let currentLevelIndex = currentLevel + 1;
    while (currentLevelIndex < El_3ed.length - 1) {
      const flag = await getNextChild(currentLevelIndex, 0);
      if (flag) {
        setCurrentLevel(currentLevelIndex);
        return;
      }
      currentLevelIndex++;
    }
  }

  const getPrevChild = async (levelIndex, index) => {
    let currentChildIndex = index;
    while (currentChildIndex >= 0) {
      if (El_3ed[levelIndex].children[currentChildIndex].active) {
        const data = await getSubtitles(El_3ed[levelIndex].children[currentChildIndex].path);
        setChildIndex(currentChildIndex);
        updateSubtitle(data, data.length - 2);
        return true;
      }
      currentChildIndex--;
    }
    console.log("Not found active child");
    return false;
  };

  const getPrevLevel = async () => {
    console.log("Enter getPrevLevel", currentLevel);
    let currentLevelIndex = currentLevel - 1;
    while (currentLevelIndex >= 0) {
      console.log("Enter getPrevLevel", currentLevelIndex);
      const flag = await getPrevChild(currentLevelIndex, El_3ed[currentLevelIndex].children.length - 1);
      if (flag) {
        setCurrentLevel(currentLevelIndex);
        return;
      }
      currentLevelIndex--;
    }
  }


  const nextStep = async () => {
    if (currentIndex < subtitles.length - 2) {
      updateSubtitle(subtitles, currentIndex + 2);
    } else {
      const flag = await getNextChild(currentLevel, childIndex + 1);
      console.log(`nextStep flag: ${flag}`);
      if (!flag) {
        await getNextLevel();
      }
    }
  };

  const prevStep = async () => {
    if (currentIndex - 2 >= 0) {
      updateSubtitle(subtitles, currentIndex - 2);
    } else {
      const flag = await getPrevChild(currentLevel, childIndex - 1);
      console.log(`prevStep flag: ${flag}`);
      if (!flag) {
        await getPrevLevel();
      }
    }
  };

  return (
    <>
      <div style={{ direction: 'rtl', display: 'flex', justifyContent: 'space-evenly', gap: '25px', maxWidth: '100%', overflow: 'auto' }}>
        {
          El_3ed.map((item, levelIndex) => {
            return (
              <>
                <ol key={levelIndex} style={{ direction: 'rtl', backgroundColor: 'gray', minWidth: '200px', paddingBottom: "10px" }}>
                  <h2>{item.title}</h2>
                  {item.children.map((item, childIndex) => {
                    return (
                      <li key={childIndex} onClick={handleItemClick(item.path, levelIndex, childIndex)}>
                        {item.name}
                      </li>
                    );

                  })}
                </ol>
              </>
            )
          })
        }
      </div>
      <SubtitleComponent
        subtitle_1={subtitles[currentIndex]}
        subtitle_2={subtitles[currentIndex + 1]}
        prevStep={prevStep}
        nextStep={nextStep}
      />
    </>
  );
};

export default App;
