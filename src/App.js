import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import _ from 'lodash';
import './App.css';

const ItemTypes = {
  WORD: 'word',
};

// Component DragWord - used for draggable words
const DragWord = ({ word, color }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.WORD,
    item: { word },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <span
      ref={drag}
      style={{
        padding: '8px 16px',
        margin: '4px',
        cursor: 'move',
        color: color === 'red' ? 'red' : 'black',
        backgroundColor: isDragging ? '#f0ad4e' : 'white',
        border: `2px solid ${color === 'red' ? 'red' : '#337ab7'}`,
        borderRadius: '4px',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.3s ease',
      }}
    >
      {word}
    </span>
  );
};

// Component DropBlank - used for blanks where words are dropped
const DropBlank = ({ correctAnswer, onDrop, isFilled, filledWord, onInputChange }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.WORD,
    drop: (item) => onDrop(item.word, correctAnswer),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <span
      ref={drop}
      className={`drop-blank ${isFilled ? 'filled' : ''}`}
      style={{
        backgroundColor: isOver ? '#f5f5f5' : '#f8f9fa',
      }}
    >
      {isFilled ? (
        filledWord
      ) : (
        <input
          type="text"
          value={filledWord || ''}
          onChange={(e) => onInputChange(correctAnswer, e.target.value)}
        />
      )}
    </span>
  );
};

const App = () => {
  const questionData = {
    paragraph: "The sky is [_input] and the grass is [_input]. You should drag the word <span style='color: red;'>green</span> to the correct blank.",
    blanks: [
      { id: 1, correctAnswer: 'blue' },
      { id: 2, correctAnswer: 'green' },
    ],
    dragWords: [
      { word: 'blue', color: 'default' },
      { word: 'green', color: 'red' },
      { word: 'yellow', color: 'default' },
      { word: 'red', color: 'default' },
    ],
  };

  const [paragraphFilledBlanks, setParagraphFilledBlanks] = useState({});
  const [tableFilledBlanks, setTableFilledBlanks] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [remainingDragWords, setRemainingDragWords] = useState(questionData.dragWords);

  // Handle drop for paragraph blanks
  const handleParagraphDrop = (word, correctAnswer) => {
    setParagraphFilledBlanks((prev) => {
      const prevWord = prev[correctAnswer];
      if (prevWord) {
        // Return the previous word to the remaining words list
        setRemainingDragWords((prevWords) => [...prevWords, { word: prevWord, color: 'default' }]);
      }
      return {
        ...prev,
        [correctAnswer]: word,
      };
    });
    removeWordFromList(word);
  };

  // Handle drop for table blanks
  const handleTableDrop = (word, correctAnswer) => {
    setTableFilledBlanks((prev) => {
      const prevWord = prev[correctAnswer];
      if (prevWord) {
        // Return the previous word to the remaining words list
        setRemainingDragWords((prevWords) => [...prevWords, { word: prevWord, color: 'default' }]);
      }
      return {
        ...prev,
        [correctAnswer]: word,
      };
    });
    removeWordFromList(word);
  };

  // Remove word from list once it's dropped
  const removeWordFromList = (word) => {
    setRemainingDragWords((prevWords) =>
      _.reject(prevWords, { word }) // Remove the word using lodash
    );
  };

  // Handle input change for manually entered values
  const handleInputChange = (correctAnswer, value) => {
    setInputValues((prev) => ({
      ...prev,
      [correctAnswer]: value,
    }));
  };

  // Handle submission check
  const handleSubmit = () => {
    const isCorrect =
      questionData.blanks.every(
        (blank) =>
          inputValues[blank.correctAnswer] === blank.correctAnswer ||
          paragraphFilledBlanks[blank.correctAnswer] === blank.correctAnswer
      );

    if (isCorrect) {
      toast.success('Chính xác!', { position: "top-center", autoClose: 2000 });
    } else {
      toast.error('Sai rồi, thử lại nhé!', { position: "top-center", autoClose: 2000 });
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container">
        <h3>Drag the word into the correct blank</h3>
        <p>
          The sky is{' '}
          <DropBlank
            correctAnswer="blue"
            onDrop={handleParagraphDrop} // Use paragraph-specific handler
            isFilled={!!paragraphFilledBlanks['blue']}
            filledWord={paragraphFilledBlanks['blue'] || inputValues['blue']}
            onInputChange={handleInputChange}
          />{' '}
          and the grass is{' '}
          <DropBlank
            correctAnswer="green"
            onDrop={handleParagraphDrop} // Use paragraph-specific handler
            isFilled={!!paragraphFilledBlanks['green']}
            filledWord={paragraphFilledBlanks['green'] || inputValues['green']}
            onInputChange={handleInputChange}
          />.
          You should drag the word{' '}
          <span style={{ color: 'red', fontWeight: 'bold' }}>green</span> to the correct blank.
        </p>
        
        {/* Table section with separate state */}
        <table className="border-collapse border border-slate-400 mt-10">
          <thead>
            <tr className="border border-black">
              <th className="border border-solid border-slate-600 p-2">
                <DropBlank
                  correctAnswer="blue"
                  onDrop={handleTableDrop} // Use table-specific handler
                  isFilled={!!tableFilledBlanks['blue']}
                  filledWord={tableFilledBlanks['blue']}
                />
              </th>
              <th className="border border-solid border-slate-600 p-2">Contact</th>
              <th className="border border-solid border-slate-600 p-2">Country</th>
            </tr>
          </thead>
        </table>

        <h4>Words to drag:</h4>
        <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap' }}>
          {remainingDragWords.map((word) => (
            <DragWord
              key={word.word}
              word={word.word}
              color={word.color}
            />
          ))}
        </div>

        <button type="button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
      <ToastContainer />
    </DndProvider>
  );
};

export default App;
