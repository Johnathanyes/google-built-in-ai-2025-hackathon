import { AddHighlightRequest } from "../db";
import { DBOperations } from "../db";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "ADD_HIGHLIGHT") {
        const payload = msg.payload as AddHighlightRequest;
        
    }
})