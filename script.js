console.log("lets write js")
let currentSong = new Audio(); // we want to play only one song at one time so we use this one
let songs;
let currfolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}


async function getSongs(folder) {

    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`); //it is used to make http request here we are requesting from our local server we can write our folder as https://127:0 like this and use it in javascript to access it
    let response = await a.text(); //it pausees execution untial promise is resolved
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        // if (element.href.endsWith(".mp3")) {
        //     songs.push(element.href.split("/songs/")[1]); here we are taking after the song/ part i.e name if song
        // }
        let filename = element.textContent.trim(); // just the text
        if (filename.endsWith(".mp3")) {
            songs.push(filename);
        }
       


    }

    //show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
                        <img class="invert" src="music.svg" alt="">
                        <div class="info">
                            <div>${decodeURIComponent(song)}</div>
                            <div>Farhan</div>
                        </div>
                        <div class="playnow">
                            <span>Play Now</span>
                            <img class="invert" src="play.svg" alt="">
                        </div>
        
         </li>`;
    }

    //Attach an event listener to each song we get all the li 
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML) //we want to play the song which we click ,so from above we take the first song from the info so we use info as queryselector
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })

    })
    return songs;

}

const playMusic = (track, pause = false) => {
    // let audio=new Audio("/songs/" +track); as all songs aer playing at same time so to avoid this we aer using currecnt song means only one song plays at one time
    currentSong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00/00:00";


}

async function displayAlbums() {
    let res = await fetch(`http://127.0.0.1:3000/songs/`);
    let html = await res.text();
    let div = document.createElement("div");
    div.innerHTML = html;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    for (let i = 0; i < anchors.length; i++) {
        const a = anchors[i];
        let name = a.textContent.trim();
        if (!name || name === "../") continue; // skip empty and parent folder links

        let folder = name.replace("/", ""); // remove trailing slash
        try {
            // fetch info.json
            let infoRes = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let info = await infoRes.json();

            // create card HTML
            let card = document.createElement("div");
            card.classList.add("card");
            card.dataset.folder = folder;
            card.innerHTML = `<div class="play">
                                <div class="icon-circle">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                        <circle cx="12" cy="12" r="12" fill="green" />
                                        <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="#000" stroke-width="1.5" stroke-linejoin="round" fill="black"/>
                                    </svg>
                                </div>
                            </div>
                            <img src="/songs/${folder}/cover.jpg" alt="">
                            <h2>${info.title}</h2>
                            <p>${info.description}</p>`;

            // append card
            cardContainer.appendChild(card);

            // attach click listener **immediately**
            card.addEventListener("click", async () => {
                currentSong.pause();
                songs = await getSongs(`songs/${folder}`);
                playMusic(songs[0]);
            });

        } catch (err) {
            console.log("No info.json for", folder, err);
        }
    }
}

async function main() {


    //get the list of all songs
    await getSongs("songs/ncs");
    playMusic(songs[0],true); // at deafult we want our first song to be displayed or when we reload the page

    //display all the albums on the page
    displayAlbums()


    // Attach an event listener to play next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg";

        }

        else {
            currentSong.pause();
            play.src = "play.svg";
        }
    })

    // Play the first song


    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}:${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"; // to move the seek bar when the video starts playing we use this 
    })

    // Add an event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let precent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = precent + "%"; // it means the seek bar circle left moves based on where we click if we click at the end 
        currentSong.currentTime = ((currentSong.duration) * precent) / 100; // this is to update the duration when we click somewhere on the seekbar
    })

    // Add an event listener for hamburger means if we click on hamburger the left part i.e library is displayed
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%"; // making the position of the left part as 0 when we click on hamburger 0 means the original postion where it was at the start
    })

    // Add an event listener for close 
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%"; // means when we click on the close button it will close so we make it as -120% some times with 100% it works but in this case it is not completely gone with 100% so we do here 120% ,if 0% means it is completed displayed as we used it above
    })

    //Add an eventListener to previous and next
    previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("Previous clicked");

    // Extract current file name properly
    let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
    let index = songs.indexOf(currentFile);
    console.log(songs, index);

    if (index > 0) {
        playMusic(songs[index - 1]);
    }
});

next.addEventListener("click", () => {
    currentSong.pause();
    console.log("Next clicked");

    // Extract current file name properly
    let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
    let index = songs.indexOf(currentFile);
    console.log(songs, index);

    if (index < songs.length - 1) {
        playMusic(songs[index + 1]);
    }
});
        

        //Add an evvent to volumn here getElementsByTagName gives list but we want only 1st one to addevent so we use [0]
        document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
            console.log("Setting volume to", e.target.value, "/100");
            currentSong.volume = parseInt(e.target.value) / 100;
            if(currentSong.volume>0){
                document.querySelector(".volume>img").src =  document.querySelector(".volume>img").src.replace("mute.svg","volume.svg");
            }
        })

    

    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]);
            
            

        })
    })

    // Add event listner to mute the volume
    document.querySelector(".volume>img").addEventListener("click", e=>{
        
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg");
            currentSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
             e.target.src = e.target.src.replace("mute.svg","volume.svg");
            currentSong.volume=.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })



}
main()
