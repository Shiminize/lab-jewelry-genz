.[]
| select(._meta["io.modelcontextprotocol.registry/official"].isLatest == true)
| . as $item
| (
    (
      ((($item.server.packages // [])
       | map((.environmentVariables // []) | length)
       | add) // 0)
    )
    +
    (
      ((($item.server.remotes // [])
       | map((.headers // []) | length)
       | add) // 0)
    )
  ) as $secret_count
| select($secret_count > 0)
| $item.server.name
