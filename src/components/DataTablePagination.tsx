import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const PER_PAGE_OPTIONS = [
  { value: "10", label: "10" },
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
  { value: "500", label: "500" },
];

interface Props {
  page: number;
  per_page?: number;
  totalPages: number;
  totalData?: number;
  onPageChange: (page: number) => void;
  maxButtons?: number; // Por defecto 5
  setPerPage?: (page: number) => void;
}

export default function DataTablePagination({
  page,
  per_page = DEFAULT_PER_PAGE,
  totalPages,
  totalData,
  onPageChange,
  maxButtons = 5,
  setPerPage,
}: Props) {
  const [buttons, setButtons] = useState(maxButtons);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const handler = () => setButtons(media.matches ? 2 : maxButtons);
    handler();
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [maxButtons]);

  const half = Math.floor(buttons / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(totalPages, page + half);

  if (end - start < buttons - 1) {
    if (start === 1) {
      end = Math.min(totalPages, start + buttons - 1);
    } else if (end === totalPages) {
      start = Math.max(1, end - buttons + 1);
    }
  }

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // ...el resto del componente igual
  return (
    <Pagination className="flex flex-col md:flex-row justify-center items-center md:justify-between">
      {per_page && setPerPage && totalData ? (
        <div className="flex gap-2 items-center">
          <SearchableSelect
            options={PER_PAGE_OPTIONS}
            value={per_page.toString()}
            onChange={(page) => {
              setPerPage(Number(page));
            }}
            className="w-fit"
          />
          <p className="text-muted-foreground text-sm">
            {`Mostrando ${
              per_page > totalData ? totalData : per_page
            } de ${totalData} resultados`}
          </p>
        </div>
      ) : null}
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) onPageChange(page - 1);
            }}
          />
        </PaginationItem>

        {start > 1 && (
          <>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(1);
                }}
              >
                1
              </PaginationLink>
            </PaginationItem>
            {start > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}

        {pages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              href="#"
              isActive={p === page}
              onClick={(e) => {
                e.preventDefault();
                onPageChange(p);
              }}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(totalPages);
                }}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page < totalPages) onPageChange(page + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
