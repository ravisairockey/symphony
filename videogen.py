import tkinter as tk
from tkinter import messagebox
import requests
import time
import threading

API_KEY = "YOUR_API_KEY_HERE"


def generate_video(prompt):
    try:
        # Step 1: Submit request
        response = requests.post(
            "https://openrouter.ai/api/v1/videos",
            headers={
                "Authorization": f"Bearer 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",
                "Content-Type": "application/json"
            },
            json={
                "model": "google/veo-3.1",
                "prompt": prompt,
                "resolution": "720p"
            }
        )

        data = response.json()

        if "polling_url" not in data:
            messagebox.showerror("Error", str(data))
            return

        polling_url = data["polling_url"]
        status_label.config(text="Status: Processing...")

        # Step 2: Poll
        while True:
            time.sleep(20)
            res = requests.get(polling_url, headers={
                "Authorization": f"Bearer {API_KEY}"
            })

            status_data = res.json()
            status = status_data["status"]

            status_label.config(text=f"Status: {status}")

            if status == "completed":
                video_url = status_data["unsigned_urls"][0]

                video = requests.get(video_url)

                with open("output.mp4", "wb") as f:
                    f.write(video.content)

                messagebox.showinfo("Success", "Video saved as output.mp4")
                break

            elif status == "failed":
                messagebox.showerror("Error", str(status_data))
                break

    except Exception as e:
        messagebox.showerror("Error", str(e))


def start_generation():
    prompt = prompt_entry.get()

    if not prompt.strip():
        messagebox.showwarning("Warning", "Enter a prompt!")
        return

    threading.Thread(target=generate_video, args=(prompt,), daemon=True).start()


# GUI setup
root = tk.Tk()
root.title("AI Video Generator")
root.geometry("400x250")

tk.Label(root, text="Enter Prompt:").pack(pady=10)

prompt_entry = tk.Entry(root, width=50)
prompt_entry.pack(pady=5)

generate_btn = tk.Button(root, text="Generate Video", command=start_generation)
generate_btn.pack(pady=15)

status_label = tk.Label(root, text="Status: Idle")
status_label.pack(pady=10)

root.mainloop()