export const backToHistoryPrompt = (uniqueTitle: string, setCurrentTitle: Function, setMessage: Function, setText: Function) => {
  setCurrentTitle(uniqueTitle);
  setMessage(null);
  setText('');
};
