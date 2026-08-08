document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".video-atc-btn");

    const observer = new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
            if(!entry.isIntersecting){
                entry.target.pause();
                }
            });
        },{
        threshold:0.5
    });

    document.querySelectorAll(".shoppable-video").forEach(video=>{
        video.addEventListener("click", () => {
            if(video.paused){
                video.play();
            }else{
                video.pause();
            }
        });
    });

    buttons.forEach(button => {
        button.addEventListener("click", async () => {
            e.preventDefault();
            const form = button.closest("form");
            if (!form) return;
            form.requestSubmit();
        });

    });
});