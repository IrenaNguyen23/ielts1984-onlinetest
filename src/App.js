import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'; // Import file CSS

const ItemTypes = {
  WORD: 'word',
};

// Component DragWord - Dùng để kéo thả các từ
const DragWord = ({ word, color, onDrop }) => {
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
      className={`drag-word ${color === 'red' ? 'red' : 'default'}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {word}
    </span>
  );
};

// Component DropBlank - Dùng để hiển thị các ô trống có thể điền từ hoặc nhập tay
const DropBlank = ({ correctAnswer, onDrop, isFilled, filledWord, onInputChange }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.WORD,
    drop: (item) => onDrop(item.word, correctAnswer),
    canDrop: (item) => item.word === correctAnswer, // Chỉ chấp nhận từ đúng
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
        filledWord // Hiển thị từ đã điền hoặc kéo thả
      ) : (
        <input
          type="text"
          value={filledWord || ''}
          onChange={(e) => onInputChange(correctAnswer, e.target.value)} // Cập nhật khi người dùng nhập
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

  const [filledBlanks, setFilledBlanks] = useState({});
  const [inputValues, setInputValues] = useState({});

  // Xử lý khi kéo thả từ vào ô trống
  const handleDrop = (word, correctAnswer) => {
    setFilledBlanks((prev) => ({
      ...prev,
      [correctAnswer]: word,
    }));
  };

  // Xử lý khi người dùng nhập vào ô trống
  const handleInputChange = (correctAnswer, value) => {
    setInputValues((prev) => ({
      ...prev,
      [correctAnswer]: value,
    }));
  };

  const handleSubmit = () => {
    const isCorrect =
      questionData.blanks.every(
        (blank) =>
          inputValues[blank.correctAnswer] === blank.correctAnswer ||
          filledBlanks[blank.correctAnswer] === blank.correctAnswer
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
            onDrop={handleDrop}
            isFilled={!!filledBlanks['blue']}
            filledWord={filledBlanks['blue'] || inputValues['blue']}
            onInputChange={handleInputChange}
          />{' '}
          and the grass is{' '}
          <DropBlank
            correctAnswer="green"
            onDrop={handleDrop}
            isFilled={!!filledBlanks['green']}
            filledWord={filledBlanks['green'] || inputValues['green']}
            onInputChange={handleInputChange}
          />.
          You should drag the word{' '}
          <span style={{ color: 'red', fontWeight: 'bold' }}>green</span> to the correct blank.
        </p>

        <h4>Words to drag:</h4>
        <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap' }}>
          {questionData.dragWords.map((word) => (
            <DragWord
              key={word.word}
              word={word.word}
              color={word.color}
              onDrop={handleDrop}
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
