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
  const [styleVersion, setStyleVersion] = useState(0);

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

  const updateStyleVersion = (style) => {
    setStyleVersion(style);
    if (socket) {
      socket.send(JSON.stringify({ action: 'updateStyleVersion', styleVersion: style }));
    }
  }


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
              <div style={{ backgroundColor: (levelIndex === currentLevel ? 'teal':'gray'), minWidth: '250px', textAlign: 'center' }}>
                <h2 style={{ color: (levelIndex === currentLevel ? 'white' : 'black') }}>{item.title}</h2>
                <ol key={levelIndex} style={{ textAlign: 'right', columnCount: (item.children.length > 15 ? '2' : '1'), direction: 'rtl', paddingBottom: "10px", marginLeft: '2px' }}>
                  {item.children.map((item, childNumber) => {
                    return (
                      <li key={childNumber} onClick={handleItemClick(item.path, levelIndex, childNumber)}
                        style={{
                          color: (
                            currentLevel === levelIndex ?
                              childIndex === childNumber ?
                                'HighlightText' : 'black' : 'black'
                          )
                        }}
                      >
                        {item.name}
                      </li>
                    );

                  })}
                </ol>
              </div>
            )
          })
        }
      </div>
      <fieldset>
        <legend>اختر نظام العرض</legend>
        <div>
          <input type="radio" id="first" name="styleVersion" value="0" onClick={(e) => { updateStyleVersion(0) }} checked={styleVersion === 0} />
          <label for="first">النظام الاول</label>
          <br />
          <input type="radio" id="second" name="styleVersion" value="1" onClick={(e) => { updateStyleVersion(1) }} checked={styleVersion === 1} />
          <label for="second">النظام الثانى</label>
        </div>

      </fieldset>
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
