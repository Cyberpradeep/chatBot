document.addEventListener("DOMContentLoaded", () => {
    const chat_scroll = document.getElementById("chat_area");
    const user_prompt = document.getElementById("user_prompt");
    const form = document.getElementById("user_form");
    const bt = document.getElementById("bt");

    document.addEventListener('click', (e) => {
        console.log(e.target.classList);
        if (e.target.classList.contains('code') || e.target.tagName === 'CODE') {
            const text = e.target.innerText;
            navigator.clipboard.writeText(text).then(() => {
                alert("Code Copied");
            }).catch(err => { console.log("Failed to copy code:", err) });
        }
    })

    window.onload = () => {
        chat_scroll.scrollTop = chat_scroll.scrollHeight;
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
            div.innerHTML = `<p style="padding:5px"><strong>Thinking....,</strong></p>`;
            chat_scroll.appendChild(div);
            parse = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    break;
                }
                const chunk = decoder.decode(value);
                parse += chunk;
                div.innerHTML = `<p><strong>Coach:</strong>${marked.parse(parse)}</p>`;
                chat_scroll.scrollTop = chat_scroll.scrollHeight;

            }

        } catch (err) {
            console.error("Error:", err);
            chat_scroll.innerHTML += `<div class="error"><strong style="color:red;">Something went wrong</strong></div>`;
        }
        
        bt.disabled = false;
        bt.innerText = "Send";
        chat_scroll.scrollTop = chat_scroll.scrollHeight;
    }
});