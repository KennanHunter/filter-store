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
import { useSearch } from "./lib/useSearch";

export default function App() {
  const { state, set } = useSearch();

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
            <Text>Set Complex State</Text>
            <TextInput
              value={state.complex.start}
              onChange={(event) =>
                set("complex")({
                  start: event.currentTarget.value ? Number.parseInt(event.currentTarget.value) : undefined,
                })
              }
            />
          </Paper>
          <Paper p="md" withBorder>
            <Text>Stringified</Text>
            {/* <Code block>{stringifyResult}</Code> */}
          </Paper>
        </SimpleGrid>
      </Box>
    </MantineProvider>
  );
}
