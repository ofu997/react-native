import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Todo {
    name: string,
    indexing: number
}

// useMemo remembers a computed value between renders

const UseMemo = () => {
  const [count, setCount] = useState(0);
  const [indexCount, setIndexCount] = useState(0);
  //  Explicitly type the state as an array of strings
  const [todos, setTodos] = useState<Todo[]>([]);

  const expensiveCalculation = (num: number) => {
  console.log("Calculating from useMemo...");
  for (let i = 0; i < 1000000000; i++) {
    num += 1;
  }
  return num;
};

  // without useMemo
  //const calculation = expensiveCalculation(count); 
  // Will only recompute the memoized value when one of the deps has changed
  // pass in [todo] and it will only update when a Todo is added
  const calculation = useMemo(() => expensiveCalculation(count), [count]);
  const increment = () => {
    setCount((c) => c + 1);
  };
  const addTodo = () => {
    setIndexCount(indexCount + 1);
    let mytodo : Todo = { name: "New to-do", indexing: indexCount}
    setTodos((t) => [...t, mytodo]);
  };

  const buttonStyle = {
    borderWidth: 5, borderColor: "#8802c6ff", padding: 20
  }

  return (
    <SafeAreaView className=" flex-1 px-10">
      <ScrollView>

        <View className="flex justify-center items-center flex-1 flex-col gap-5">
            {/* <ScrollView
                data={todos}
                renderItem={({ item }) => (
                    <Text>{item}</Text>
                )}
            /> */}
            <button style={buttonStyle} onClick={addTodo}>Add Todo</button>
            {todos.map((todo) => {
                return(
                <Text key={todo.indexing}>{todo.name} number {todo.indexing}</Text>)
            })}



        </View>


        <View className="flex justify-center items-center flex-1 flex-col gap-5">
            <Text>Count: {count}</Text>
            <button onClick={increment}
                style={buttonStyle}
            >+</button>
            <Text>Expensive calculation</Text>
            <Text>{calculation}</Text>
        </View>
        </ScrollView>        





    </SafeAreaView>
  );
};

export default UseMemo;