import {
  Box,
  Code,
  MantineProvider,
  Paper,
  SimpleGrid,
  Text,
  TextInput,
} from "@mantine/core";
import { Prism } from "@mantine/prism";
import { useEffect, useState } from "react";

import { useFilterStore } from "./stores/filter";

export default function App() {
  const state = useFilterStore((store) => store.state);
  const setSimple = useFilterStore((store) => store.set("simple"));
  //     ^?
  const stringify = useFilterStore((store) => store.serialize);

  const [stringifyResult, setStringifyResult] = useState<string>();
  useEffect(() => {
    setStringifyResult(stringify());
  });

  return (
    <MantineProvider
      theme={{ colorScheme: "dark" }}
      withGlobalStyles
      withNormalizeCSS
    >
      <Box m={"xl"}>
        <SimpleGrid cols={2}>
          <Paper p={"md"} withBorder>
            <Text>Store data</Text>
            <Prism language="json">{JSON.stringify(state, undefined, 2)}</Prism>
          </Paper>
          <Paper p="md" withBorder>
            <Text>Set Simple State</Text>
            <TextInput
              value={state.simple}
              onChange={(event) => setSimple(event.currentTarget.value)}
            />
          </Paper>
          <Paper p="md" withBorder>
            <Text>Stringified</Text>
            <Code block>{stringifyResult}</Code>
          </Paper>
        </SimpleGrid>
      </Box>
    </MantineProvider>
  );
}
