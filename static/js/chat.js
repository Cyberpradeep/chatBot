document.addEventListener("DOMContentLoaded", () => {
    const chat_scroll = document.getElementById("chat_area");
    const user_prompt = document.getElementById("user_prompt");
    const form = document.getElementById("user_form");
    const bt = document.getElementById("bt");

    // document.addEventListener('click', (e) => {
    //     console.log(e.target.classList);
    //     if (e.target.classList.contains('code') || e.target.tagName === 'CODE') {
    //         const text = e.target.innerText;
    //         navigator.clipboard.writeText(text).then(() => {
    //             alert("Code Copied");
    //         }).catch(err => { console.log("Failed to copy code:", err) });
    //     }
    // })

    function chathistroyall(){
        const mssg=document.querySelectorAll(".coach");
        mssg.forEach(msgs=>{
            const trmsg=msgs.innerText.trim();
            if(trmsg.startsWith("Coach:")){
                // console.log("trmsg",trmsg);
                const newmsg=trmsg.replace("Coach:","");
                console.log("inside");
                try{
                    let newmsg1 = newmsg.replace(/[\u0000-\u0019]+/g, ""); 
                    const json_val = JSON.parse(newmsg1);
                    msgs.innerHTML = `<p style="padding:5px"><strong>Coach: </strong></p>`;
                    json_val.components.forEach(val=>{
                        const val1=style(val);
                        msgs.innerHTML += val1;
                    })
                }
                catch(err){
                    console.log("Error Occured",err);
                }
                
            }
        })
    }

chathistroyall();

    window.onload = () => {
        chat_scroll.scrollTop = chat_scroll.scrollHeight;
        hljs.highlightAll();
        chathistroyall();
    }

    form.onsubmit = async (e) => {
        e.preventDefault();
        const msg = user_prompt.value.trim();
        if (!msg) {
            return;
            //chat_scroll.scrollIntoView({ behavior: "smooth", block: "end" });
        }
        chat_scroll.innerHTML += `<p class="you"><strong style="color:white">You:</strong> ${msg}</p>`;
        user_prompt.value = "";
        bt.disabled = true;
        bt.innerText = "Thinking...";
        chat_scroll.scrollTop = chat_scroll.scrollHeight;

        try {
            const res = await fetch("/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ user_prompt: msg })
            });

            // const data = await res.json();
            // chat_scroll.innerHTML += `<div class="coach"><p><strong>Coach:</strong></p>${data.chatbot_reply}</div>`;
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let div = document.createElement("div");
            div.className = 'coach';
            div.innerHTML = `<p style="padding:5px"><strong>Coach: </strong><span>Thinking...</span></p>`;
            chat_scroll.appendChild(div);
            chat_scroll.scrollTop = chat_scroll.scrollHeight;
            parse = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    break;
                }
                const chunk = decoder.decode(value);
                parse += chunk;
            //     let valid=parse.split("\n");
            //    parse= valid.pop();
            //    for(let i=0;i<valid.length;i++){
            //     if(valid[i].trim()!==""){
            //         const val=JSON.parse(valid[i]);
            //         const val2=style(val);
            //         div.innerHTML += val2;
            //         chat_scroll.scrollTop = chat_scroll.scrollHeight;
            //     }
            //    }
                    div.innerHTML = `<strong>Coach:</strong> ` + marked.parse(parse);
                chat_scroll.scrollTop = chat_scroll.scrollHeight;
                try {
                const json_dt = JSON.parse(parse);
                div.innerHTML = `<p style="padding:5px"><strong>Coach: </strong></p>`;
                json_dt.components.forEach(element => {
                    const val = style(element);
                    div.innerHTML += val;
                });
            } catch (err) {
                console.error("Error parsing JSON:", err);
            }




            hljs.highlightAll();
        }} catch (err) {
            console.error("Error:", err);
            chat_scroll.innerHTML += `<div class="error"><strong style="color:red;">Something went wrong</strong></div>`;
        }

        bt.disabled = false;
        bt.innerText = "Send";
        chat_scroll.scrollTop = chat_scroll.scrollHeight;
    }
    function style(element) {
        if (element.type === 'text')
            return textStyle(element.content);
        else if (element.type === "explaination")
            return explainStyle(element.content);
        else if (element.type === "code")
            return codeStyle(element.content);
        else
            return '';
    }
    function textStyle(content) {
        return `
        <div class="textStyle">
        <p class="textContent">${content.text}</p>
        </div>
        `
    }
    function explainStyle(content) {
        const { topic, technical, analogy, withoutIt, flow, code } = content;
        console.log(content);
        console.log(code);
        // console.log(topic + technical + analogy + withoutIt + flow + code);
        return `
        <div class="explainStyle coach">
        <div class="explainTopic" onclick="expand(this)">
        <span class="topicTitle">Topic: ${topic}</span>
        <span class="expandbt">[+]</span>
        </div>
        <div class="explainText">
        <strong>Definition: </strong>${technical}
        </div>
        <div class="explaineg" style="display:none">
        <div class="egdiv">
        <div class="egTitle">Example:</div>
        <div class="egContent">${analogy}</div>
        </div>
        <div class="without wth_it">
        <div class="withoutTitle">Without it:</div>
        <div class="withoutContent">${withoutIt}</div>
        </div>
        <div class="flow fl_st">
        <div class="flowTitle">How it works:</div>
        <div class="flowContent">${flow}</div>
        </div>
       
        <button class="btexpand" onclick="expand(this)">Show Details</button>
        </div>
        `
    }
    function codeStyle(content) {
        const { language, code } = content;
        return `
    <div class="codeStyle code pre">
    <div class="codeTitle">${language}</div>
    <button class="copybt" onclick="copy(this)">Copy</button>
    <pre><code>${code}</code></pre>
    </div>
    `
    }

    window.expand = function (bt) {
        const explainStyle = bt.closest('.explainStyle');
        const explaineg = explainStyle.querySelector('.explaineg');
        // const next = explainTopic.nextElementSibling;
        // const next2 = next.nextElementSibling;
        const expandbt = explainStyle.querySelectorAll('.expandbt');
        const but=explainStyle.querySelector('.btexpand');
        if (explaineg.style.display === "none") {
            explaineg.style.display = "block";
            expandbt.forEach(bt => bt.innerText = "[-]");
            but.innerText = "Hide Details";
        } else {
            explaineg.style.display = "none";
            // expandbt.innerText = "[+]";
            expandbt.forEach(bt=>bt.innerText="[+]");
            but.innerText = "Show Details";
        }
    };
    window.copy = function (bt) {
        const codecont = bt.nextElementSibling;
        // const next = codecont.nextElementSibling;
        const code = codecont.innerText;
        bt.innerText = "Copied";
        navigator.clipboard.writeText(code).then(() => {
            alert("Code Copied");
        })
    }
});