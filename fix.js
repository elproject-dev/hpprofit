const fs = require("fs");
let content = fs.readFileSync("app/produk/components/produk-form.tsx", "utf8");

const startStr = `<h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Komposisi Packaging</h3>`;
const endStr = `{/* 4. FINANCIAL SUMMARY */}`;

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
    const fixedBlock = \`
          <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Komposisi Packaging</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setKomposisiPackage([...komposisiPackage, { id: Math.random().toString(), packagingId: "", jumlah: "", pembagi: "1", searchQuery: "" }])}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Tambah Packaging
          </Button>
        </div>

        {komposisiPackage.length === 0 ? (
          <div className="text-center py-4 text-[11px] text-muted-foreground border-2 border-dashed rounded-md">
            Belum ada packaging.<br></br>Klik tombol tambah jika produk membutuhkan kemasan.
          </div>
        ) : (
          <div className="border rounded-none bg-card overflow-x-auto">
            <Table className="[&_th]:border-r [&_td]:border-r [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0">
              <TableHeader className="bg-muted text-foreground">
                <TableRow>
                  <TableHead>Packaging</TableHead>
                  <TableHead className="w-[150px]">Harga Satuan</TableHead>
                  <TableHead className="w-[130px] text-center">Jumlah Dipakai</TableHead>
                  <TableHead className="w-[150px] text-center">Bisa Untuk (Porsi/Pcs)</TableHead>
                  <TableHead className="w-[130px] text-center">Pemakaian / Porsi</TableHead>
                  <TableHead className="w-[150px]">HPP Subtotal</TableHead>
                  <TableHead className="w-[60px] text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {komposisiPackage.map((item, index) => {
                  const selectedPack = packagingList.find(p => p.id === item.packagingId)
                  const div = parseFloat(item.pembagi) || 1
                  const hppSubtotal = selectedPack && item.jumlah ? (selectedPack.harga * parseFloat(item.jumlah)) / div : 0

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Combobox value={item.packagingId} onValueChange={(val) => {
                          if (!val) return
                          const newArr = [...komposisiPackage]
                          newArr[index].packagingId = val as string
                          const selected = packagingList.find(p => p.id === val)
                          if (selected) newArr[index].searchQuery = selected.nama
                          setKomposisiPackage(newArr)
                        }}>
                          <ComboboxInput
                            className="w-full rounded-none"
                            placeholder="Cari kemasan..."
                            value={item.searchQuery}
                            onChange={(e) => {
                              const newArr = [...komposisiPackage]
                              newArr[index].searchQuery = e.target.value
                              setKomposisiPackage(newArr)
                            }}
                          />
                          <ComboboxContent>
                            <ComboboxList>
                              {packagingList
                                .filter(p => p.nama.toLowerCase().includes(item.searchQuery.toLowerCase()) || p.id === item.packagingId)
                                .map((p) => (
                                  <ComboboxItem key={p.id} value={p.id}>
                                    <div className="flex items-center gap-2">
                                      <span>{p.nama}</span>
                                    </div>
                                  </ComboboxItem>
                                ))}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">Rp {selectedPack ? selectedPack.harga.toLocaleString('id-ID') : "0"}</span>
                          <span className="text-xs text-muted-foreground">/ {selectedPack?.satuan || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="grid grid-cols-[4rem_1fr] items-center gap-2 w-[110px] mx-auto text-left">
                          <Input
                            className="rounded-none w-full px-2 text-center"
                            type="number"
                            step="any"
                            min="0"
                            value={item.jumlah}
                            onChange={(e) => {
                              const newArr = [...komposisiPackage]
                              newArr[index].jumlah = e.target.value
                              setKomposisiPackage(newArr)
                            }}
                            placeholder="0"
                          />
                          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis" title={selectedPack?.satuan || "-"}>{selectedPack?.satuan || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="grid grid-cols-[4rem_1fr] items-center gap-2 w-[110px] mx-auto text-left">
                          <Input
                            className="rounded-none w-full px-2 text-center"
                            type="number"
                            step="any"
                            min="1"
                            value={item.pembagi}
                            onChange={(e) => {
                              const newArr = [...komposisiPackage]
                              newArr[index].pembagi = e.target.value
                              setKomposisiPackage(newArr)
                            }}
                            placeholder="1"
                          />
                          <span className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap bg-muted px-2 py-1">Porsi</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          readOnly
                          className="rounded-none w-[110px] mx-auto px-2 text-center bg-muted/30 text-xs font-medium border-dashed focus-visible:ring-0"
                          value={formatTakaranPerPorsi(item.jumlah, item.pembagi, selectedPack?.satuan || "")}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="grid grid-cols-[1.5rem_1fr] items-center gap-1 w-full text-left">
                          <span className="text-muted-foreground text-xs font-medium text-right">Rp</span>
                          <Input
                            readOnly
                            className="rounded-none w-full px-2 text-left bg-muted/50 text-sm font-medium focus-visible:ring-0"
                            value={Math.round(hppSubtotal).toLocaleString('id-ID')}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="default"
                          size="icon"
                          className="h-9 w-9 rounded-none bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => {
                            setKomposisiPackage(komposisiPackage.filter((_, i) => i !== index))
                          }}
                        >
                          <Trash2Icon className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      \`;
    const newContent = content.substring(0, startIndex) + fixedBlock + content.substring(endIndex);
    fs.writeFileSync("app/produk/components/produk-form.tsx", newContent);
}
