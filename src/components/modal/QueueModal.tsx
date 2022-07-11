import React,{useState,useEffect,useRef} from "react";
import ReactDOM from "react-dom";
import styled from 'styled-components'
import ArtworkAtom from '../atom/ArtworkAtom'
import QueueButton from '../atom/QueueButton'
import SmallBasicButton from '../atom/SmallBasicButton'
import MidiumBasicButton from '../atom/MidiumBasicButton'
import MidiumBlueButton from '../atom/MidiumBlueButton'
import SmallBlueButton from '../atom/SmallBlueButton'
import {FaPause,FaPlay} from "react-icons/fa"
import {TbRepeatOnce,TbRepeat} from "react-icons/tb"
import {ImShuffle} from "react-icons/im"

import { useMusicState,useMusicDispatch } from '../../MusicContext';
import {Music} from '../../util/database'
const MusicDB = new Music()

const GlobalStyle = styled.div`
    background: rgb(223,234,252);
    background: linear-gradient(180deg, rgba(223,234,252,1) 0%, rgba(255,255,255,0.9870370335049099) 100%);
    background-repeat:no-repeat;
    overflow:scroll;
    min-height:100vh;
    width:100vw;
    position:absolute;
    z-index:3;
    top:0;
`
const QueueBlock = styled.div`
    margin:0 auto;
    margin-top:5rem;
    width:43rem;
    overflow:scroll;
`
const QueueTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-around;   
    width:43rem;
    margin:0 auto;
`

function QueueModal(props){
    const { open, close, header } = props;
    const [playlist,setPlayList] = useState([])
    const [select,setSelect] = useState()
    let musics = useMusicState()
    const dispatch = useMusicDispatch();
    let audioRef  = useRef();
    
    
    useEffect(async () => {
        setPlayList(await MusicDB.findAll())
        props.setAudio(audioRef)
        setSelect(musics.id)
    }, [playlist,musics]);
    
    window.addEventListener('beforeunload', function(event) {
        MusicDB.clear()
    });
    
    
    const onChangeMusic = async (e, info,i) => {
        e.preventDefault();
        dispatch({
            type: 'CHANGE',
            music: {
                id:info._id,
                index:i,
                title:info.title,
                artist:info.artist,
                artwork:info.artwork
            }
        });
        let src = await MusicDB.getAudio(info._id)
        audioRef.current.src = src;
        audioRef.current.load();
        audioRef.current.play();
    };
    let [loop,setLoop] = useState(0);
    let [shuffle,setShuffle] = useState(false);
    let [shufflePl,setShufflePl] = useState([])
    
    const handleOnEnded = async () =>{
            let pl = shuffle?shufflePl:playlist
            let index = musics.index + 1
            let info = pl[index]
            if(loop==1) return;
            if(loop==2&&!info){
                        let m = pl[0]
                        dispatch({
                            type: 'CHANGE',
                            music: {
                                id:m._id,
                                 index:0,
                                title:m.title,
                                artist:m.artist,
                                artwork:m.artwork
                            }
                        });
                        let src = await MusicDB.getAudio(m._id)
                        audioRef.current.src = src;
                        audioRef.current.load();
                        audioRef.current.play();
                        return
            }
            if(loop!==2&&!info) return;
            dispatch({
            type: 'CHANGE',
                music: {
                    id:info._id,
                    index:index,
                    title:info.title,
                    artist:info.artist,
                    artwork:info.artwork
                }
            });
            let src = await MusicDB.getAudio(info._id)
            audioRef.current.src = src;
            audioRef.current.load();
            audioRef.current.play();
    }
    
    
    const handleLoop = () => {
        if(loop==0){
            setLoop(1)
            audioRef.current.loop = true;
        }else if(loop==1){
            setLoop(2)
            audioRef.current.loop = false;
        }else{
            setLoop(0)
            audioRef.current.loop = false;
        }
    }
    
    const handleShuffle = () => {
        if(shuffle){
            setShuffle(false)
        }else{
            setShuffle(true)
            setShufflePl(shuffleArray(playlist))
        }
    }
    function shuffleArray(array) {
        let currentIndex = array.length,  randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
        return array;
    }
    
  return (
        <div className={open ? 'openModal modal' : 'modal'}>
      {open ? (
            <GlobalStyle>
                <QueueTop>
                {loop===0?
                <MidiumBasicButton pos={{
                'marginRight':'2rem',
                'marginTop':'4rem'
                }}
                icon={<TbRepeat/>}
                onClick={handleLoop}/>
                :<MidiumBlueButton pos={{
                'marginRight':'2rem',
                'marginTop':'4rem'
                }}
                icon={loop===1?<TbRepeatOnce/>:<TbRepeat/>}
                onClick={handleLoop}/>}
                <ArtworkAtom pos={{
                'width':'16rem',
                'height':'16rem',
                'padding':'0.5rem'    
                }} onClick={close} img={musics.artwork}/>
                {shuffle?
                <MidiumBlueButton pos={{'marginLeft':'2rem','marginTop':'4rem'}}
                icon={<ImShuffle/>} onClick={handleShuffle}/>
                :<MidiumBasicButton pos={{'marginLeft':'2rem','marginTop':'4rem'}}
                icon={<ImShuffle/>} onClick={handleShuffle}/>}
                </QueueTop>
                
                <QueueBlock>
                    {playlist.map((element,i) =>
                        <div className={ select === element._id ? "select_clicked" : "select_default" }
                            onClick={(e) => {
                            onChangeMusic(e, element,i)}}>
                            <QueueButton title={element.title}           artist={element.artist}/>
                    { select === element._id ? 
                            <SmallBlueButton icon={<FaPause/>}/>: 
                            <SmallBasicButton icon={<FaPlay/>}/> }
                    </div>
                )}
        
                </QueueBlock>
            
            </GlobalStyle>
      ) : null}
      <audio id="audio" 
             src=""
             onEnded={handleOnEnded}
             ref={audioRef}/>
      
    </div>
    )
};



export default QueueModal