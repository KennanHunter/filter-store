import { Box, MantineProvider, Paper, SimpleGrid, Text } from "@mantine/core";
import { Prism } from "@mantine/prism";

import { useFilterStore } from "./stores/filter";

export default function App() {
  const store = useFilterStore();

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
            <Prism language="json">{JSON.stringify(store, undefined, 2)}</Prism>
          </Paper>
        </SimpleGrid>
      </Box>
    </MantineProvider>
  );
}
