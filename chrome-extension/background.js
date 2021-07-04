/* global chrome */

//let color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ title: 'aaa' });
  //console.log('Default background color set to %cgreen', `color: ${color}`);
});